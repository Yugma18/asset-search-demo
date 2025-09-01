import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agency_id');
  let query = supabaseAdmin.from('creator').select('*').order('creator_id', { ascending: true });
  if (agencyId) query = query.eq('agency_id', Number(agencyId));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { agency_id, stage_name, categories } = await req.json();
  if (!agency_id || !stage_name) {
    return NextResponse.json({ error: 'agency_id and stage_name required' }, { status: 400 });
  }
  const cats = Array.isArray(categories)
    ? categories
    : typeof categories === 'string'
      ? categories.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
  const { data, error } = await supabaseAdmin
    .from('creator')
    .insert({ agency_id, stage_name, categories: cats })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}