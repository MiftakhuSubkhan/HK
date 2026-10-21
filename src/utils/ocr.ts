export interface SimpleCustomer {
  id?: string;
  name: string;
  village?: string;
  phone?: string;
}

export interface ExtractedReceiptData {
  rawText: string;
  totalAmount: number | null;
  detectedCustomerName: string | null;
  matchedCustomerId: string | null;
  detectedBags: number | null;
  detectedFeedType: string | null;
  detectedDate: string | null; // YYYY-MM-DD
  confidence: number;
  candidateCustomerNames?: string[];
}

/**
 * Normalizes number strings from Indonesian formatting (e.g. "1.250.000" or "1250000" or "Rp 150.000,-")
 */
function cleanNumber(str: string): number {
  // Remove non-digit characters
  const digits = str.replace(/\D/g, '');
  return parseInt(digits, 10) || 0;
}

/**
 * Parses raw OCR text from receipt to detect invoice amounts, customer names, feed types, and dates.
 */
export function parseReceiptText(
  rawText: string,
  existingCustomers: SimpleCustomer[] = []
): ExtractedReceiptData {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let totalAmount: number | null = null;
  let detectedCustomerName: string | null = null;
  let matchedCustomerId: string | null = null;
  let detectedBags: number | null = null;
  let detectedFeedType: string | null = null;
  let detectedDate: string | null = null;

  // 1. EXTRACT TOTAL AMOUNT (NOMINAL UTANG)
  // Look for lines containing "Total", "Jumlah", "Tagihan", "Bayar", or "Rp"
  const amountCandidates: { amount: number; isTotalLabel: boolean }[] = [];

  for (const line of lines) {
    const isTotalLabel = /(total|jumlah|jml|tagihan|grand|bayar|netto)/i.test(line);

    // Matches Rp 1.500.000 or 1.500.000 or 500000
    const rpMatches = line.match(/(?:rp\.?\s*)?([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,9})/gi);
    if (rpMatches) {
      for (const m of rpMatches) {
        const val = cleanNumber(m);
        // Exclude typical years (e.g. 2024, 2025, 2026) unless labeled as total
        if (val > 10000 && val !== 2024 && val !== 2025 && val !== 2026 && val !== 2027) {
          amountCandidates.push({ amount: val, isTotalLabel });
        }
      }
    }
  }

  // Prioritize explicitly labeled total lines
  const explicitTotals = amountCandidates.filter((c) => c.isTotalLabel);
  if (explicitTotals.length > 0) {
    // Pick the largest labeled total
    explicitTotals.sort((a, b) => b.amount - a.amount);
    totalAmount = explicitTotals[0].amount;
  } else if (amountCandidates.length > 0) {
    // Otherwise pick the largest detected currency amount
    amountCandidates.sort((a, b) => b.amount - a.amount);
    totalAmount = amountCandidates[0].amount;
  }

  // 2. EXTRACT BUYER / CUSTOMER NAME (NAMA PETERNAK / PEMBELI)
  // Store / Business names that must NEVER be treated as buyer (User's own store/header)
  const storeBlacklist = [
    'hasrat kerja',
    'ternak hasrat kerja',
    'hk',
    'toko',
    'koperasi',
    'ud',
    'cv',
    'pt',
    'poultry',
    'feed',
    'pakan ternak',
    'peternakan',
    'kasir',
    'admin',
    'penjual',
    'sales',
    'hormat kami',
    'tanda terima',
    'cap toko',
    'nota kontan',
    'faktur',
    'kwitansi',
    'invoice',
    'surat jalan',
    'konsentrat',
    'bekatul',
    'polar',
    'dedak',
    'jagung',
    'mineral',
    'karung',
    'sak',
    'total',
    'harga',
    'jumlah',
    'bayar',
    'sisa',
    'uang'
  ];

  const isStoreBlacklisted = (str: string): boolean => {
    const lower = str.toLowerCase().trim();
    if (!lower || lower.length < 3) return true;
    for (const b of storeBlacklist) {
      if (lower.includes(b)) return true;
    }
    return false;
  };

  const candidateCustomerNames: string[] = [];

  // First, check if any existing customer from database is explicitly mentioned on receipt
  for (const cust of existingCustomers) {
    const custClean = cust.name.toLowerCase().trim();
    if (custClean.length >= 3 && !isStoreBlacklisted(custClean)) {
      const reg = new RegExp(`\\b${custClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(rawText)) {
        detectedCustomerName = cust.name;
        matchedCustomerId = cust.id || null;
        if (!candidateCustomerNames.includes(cust.name)) {
          candidateCustomerNames.push(cust.name);
        }
        break;
      }
    }
  }

  // Regex patterns specifically targeting the BUYER / PEMBELI:
  const buyerPatterns = [
    // Pattern 1: Explicit buyer labels (e.g. Kepada Yth, Kepada, Kpd, Yth, Nama Pembeli, Pelanggan, Tuan/Toko, Tuan, Tn.)
    /(?:kepada\s+yth|kepada|kpd|yth|nama\s+pembeli|nama\s+pelanggan|nama\s+konsumen|pembeli|pelanggan|tuan\s*\/\s*toko|tuan|tn\.?)\s*[:=.-]+\s*([A-Za-z0-9\s.,'’]{3,35})/i,
    // Pattern 2: Honorific prefix with name: "Bpk. Sutrisno", "Pak Budi", "Ibu Siti", "Haji Slamet", "H. Rohman"
    /\b(?:bpk\.?|bapak|pak|ibu|ny\.?|nyonya|sdr\.?|saudara|h\.?|haji)\s+([A-Za-z\s.'’]{3,28})/i,
    // Pattern 3: Line containing "Nama :" ONLY IF line does not say "Nama Toko / Nama Barang / Nama Usaha"
    /(?:^|\s)nama\s*[:=.-]+\s*([A-Za-z\s.'’]{3,28})/i,
  ];

  for (const line of lines) {
    // Skip lines that mention store names unless they explicitly have a buyer label
    if (isStoreBlacklisted(line) && !/(kepada|yth|tuan|pembeli|pelanggan)/i.test(line)) {
      continue;
    }

    for (const pat of buyerPatterns) {
      const m = line.match(pat);
      if (m && m[1]) {
        let candidate = m[1].trim();
        // Clean trailing notes or punctuation like " - Jl...", " / ", etc.
        candidate = candidate.replace(/\s*[-/|].*$/, '').trim();
        if (!isStoreBlacklisted(candidate) && candidate.length >= 3) {
          // If matched from honorific pattern, include honorific in the name
          if (/\b(?:bpk|bapak|pak|ibu|h\.|haji)\b/i.test(line) && !/^(?:bpk|bapak|pak|ibu|h\.|haji)/i.test(candidate)) {
            const prefixMatch = line.match(/\b(bpk\.?|bapak|pak|ibu|h\.?|haji)\b/i);
            if (prefixMatch) {
              candidate = `${prefixMatch[0]} ${candidate}`;
            }
          }

          if (!candidateCustomerNames.includes(candidate)) {
            candidateCustomerNames.push(candidate);
          }

          if (!detectedCustomerName) {
            detectedCustomerName = candidate;
          }
        }
      }
    }
  }

  // 3. EXTRACT FEED ITEMS & BAG QUANTITIES
  // Look for "5 sak", "10 karung", "5 krg", "12 zak", "3 bag"
  let totalBagsFound = 0;
  for (const line of lines) {
    const bagMatch = line.match(/(\d{1,3})\s*(?:sak|karung|krg|zak|bag|bg)\b/i);
    if (bagMatch && bagMatch[1]) {
      const qty = parseInt(bagMatch[1], 10);
      if (qty > 0 && qty < 1000) {
        totalBagsFound += qty;
      }
    }
  }
  if (totalBagsFound > 0) {
    detectedBags = totalBagsFound;
  }

  // Detect Feed Type
  const feedKeywords = [
    { key: 'Konsentrat Sapi Perah', regex: /(konsentrat.*perah|sapi perah|144|ksp)/i },
    { key: 'Konsentrat Penggemukan', regex: /(konsentrat.*gemuk|penggemukan|pedaging)/i },
    { key: 'Konsentrat Super', regex: /(konsentrat)/i },
    { key: 'Bekatul / Dedak', regex: /(bekatul|dedak|katul)/i },
    { key: 'Polar Gandum', regex: /(polar|pollard)/i },
    { key: 'Jagung Giling', regex: /(jagung)/i },
    { key: 'Bungkil Kedelai', regex: /(bungkil|sbm)/i },
    { key: 'Mineral & Premix', regex: /(mineral|premix|vitamin)/i },
    { key: 'Silase Pakan', regex: /(silase|fermentasi)/i },
  ];

  for (const fk of feedKeywords) {
    if (fk.regex.test(rawText)) {
      detectedFeedType = fk.key;
      break;
    }
  }

  // 4. EXTRACT DATE (TANGGAL NOTA)
  // Formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  for (const line of lines) {
    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = line.match(/\b([0-3]?\d)[/-]([0-1]?\d)[/-](20\d{2}|\d{2})\b/);
    if (dmyMatch) {
      let day = parseInt(dmyMatch[1], 10);
      let month = parseInt(dmyMatch[2], 10);
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = month.toString().padStart(2, '0');
        detectedDate = `${year}-${monthStr}-${dayStr}`;
        break;
      }
    }
  }

  return {
    rawText,
    totalAmount,
    detectedCustomerName,
    matchedCustomerId,
    detectedBags,
    detectedFeedType,
    detectedDate,
    confidence: (totalAmount ? 0.4 : 0) + (detectedCustomerName ? 0.3 : 0) + (detectedBags ? 0.3 : 0),
    candidateCustomerNames,
  };
}

/**
 * Runs Tesseract OCR on the given image source with progress notifications
 */
export async function scanReceiptWithTesseract(
  imageSource: string | File | Blob,
  onProgress?: (progress: number, statusText: string) => void
): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  const Tesseract = (await import('tesseract.js')).default;

  try {
    onProgress?.(10, 'Menyiapkan mesin pembaca teks (OCR)...');

    const result = await Tesseract.recognize(
      imageSource,
      'ind+eng', // Indonesian + English recognition
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 80) + 15;
            onProgress?.(pct, `Membaca teks nota (${pct}%)...`);
          } else if (m.status === 'loading tesseract core' || m.status === 'loading language traineddata') {
            onProgress?.(15, 'Memuat model bahasa...');
          }
        },
      }
    );

    onProgress?.(100, 'Selesai membaca teks!');
    return result.data.text || '';
  } catch (err) {
    console.warn('Tesseract OCR ind+eng error, retrying with eng:', err);
    try {
      // Retry with eng only if ind language pack fails to download
      const fallbackResult = await Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 80) + 15;
            onProgress?.(pct, `Membaca teks nota (${pct}%)...`);
          }
        },
      });
      onProgress?.(100, 'Selesai membaca teks!');
      return fallbackResult.data.text || '';
    } catch (fallbackErr) {
      console.error('All Tesseract attempts failed:', fallbackErr);
      throw new Error('Gagal memindai nota. Pastikan gambar cukup terang dan tulisan terbaca jelas.');
    }
  }
}
