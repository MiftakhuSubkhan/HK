import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase URL atau Key belum terkonfigurasi.',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Melakukan query ringan (HEAD count) untuk mereset timer tidur Supabase
    const { count, error } = await supabase
      .from('debts')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive ping error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      status: 'active',
      message: 'Supabase keep-alive ping berhasil! Timer 7 hari Supabase telah di-reset.',
      totalDebtsCount: count,
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Keep-alive exception:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
