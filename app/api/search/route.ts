import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { embed } from '@/lib/embed';

export async function POST(req: Request) {
  const { query, agency_id, creator_id, category, limit = 60 } = await req.json();
  if (!agency_id || !creator_id || !query) {
    return NextResponse.json({ error: 'agency_id, creator_id, query required' }, { status: 400 });
  }
  const qvec = await embed(query);
  const { data, error } = await supabaseAdmin.rpc('search_assets', {
    p_agency_id: agency_id,
    p_creator_id: creator_id,
    p_query_embedding: qvec,
    p_match_count: limit,
    p_category: category ?? null
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ results: data });
}