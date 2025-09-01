import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { embed } from '@/lib/embed';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agency_id');
  const creatorId = searchParams.get('creator_id');
  let query = supabaseAdmin.from('assets').select('*').order('id', { ascending: false });
  if (agencyId) query = query.eq('agency_id', Number(agencyId));
  if (creatorId) query = query.eq('creator_id', Number(creatorId));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { description, price, category, media_type, agency_id, creator_id } = await req.json();
  if (!description || !price || !category || !agency_id || !creator_id) {
    return NextResponse.json({ error: 'description, price, category, agency_id, creator_id required' }, { status: 400 });
  }

  const vec = await embed(description);
  const { data: asset, error } = await supabaseAdmin
    .from('assets')
    .insert({ description, price, category, media_type, agency_id, creator_id, embedding: vec })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: asset.id });
}