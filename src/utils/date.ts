/**
 * Utility functions for Due Date (Jatuh Tempo) calculation and Indonesian formatting
 */

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffsetString(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffsetFromDate(baseDateStr: string, daysAhead: number): string {
  const d = parseDateString(baseDateStr);
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(dateStr);
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysDifferenceFromToday(dateStr: string): number {
  const target = parseDateString(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatIndonesianDate(dateStrOrDate: string | Date, withDayName = true): string {
  if (!dateStrOrDate) return '';
  const date = typeof dateStrOrDate === 'string' ? parseDateString(dateStrOrDate) : dateStrOrDate;
  if (isNaN(date.getTime())) return '';

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  if (withDayName) {
    return `${dayName}, ${day} ${month} ${year}`;
  }
  return `${day} ${month} ${year}`;
}

export function calculateDebtStatus(diffDays: number): {
  status: 'due_2_days' | 'due_5_days' | 'safe';
  dueDateLabel: string;
} {
  if (diffDays < 0) {
    return {
      status: 'due_2_days',
      dueDateLabel: `Lewat ${Math.abs(diffDays)} Hari`,
    };
  }
  if (diffDays === 0) {
    return {
      status: 'due_2_days',
      dueDateLabel: 'Jatuh Tempo Hari Ini',
    };
  }
  if (diffDays === 1) {
    return {
      status: 'due_2_days',
      dueDateLabel: 'Jatuh Tempo Besok',
    };
  }
  if (diffDays === 2) {
    return {
      status: 'due_2_days',
      dueDateLabel: 'Jatuh Tempo 2 Hari Lagi',
    };
  }
  if (diffDays <= 5) {
    return {
      status: 'due_5_days',
      dueDateLabel: `Jatuh Tempo ${diffDays} Hari Lagi`,
    };
  }
  return {
    status: 'safe',
    dueDateLabel: `Aman (${diffDays} Hari Lagi)`,
  };
}
