'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Agency, Creator, Asset, SearchResult } from '@/types';

type Tab = 'search' | 'add';

export default function Page() {
  const [tab, setTab] = useState<Tab>('search');

  // Shared state
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Search state
  const [sAgencyId, setSAgencyId] = useState<number | ''>('');
  const [sCreatorId, setSCreatorId] = useState<number | ''>('');
  const [sCategory, setSCategory] = useState<string>('');
  const [sQuery, setSQuery] = useState<string>('');
  const [sLimit, setSLimit] = useState<number>(60);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const sCreator = useMemo(
  () => (Array.isArray(creators) ? creators.find(c => c.creator_id === Number(sCreatorId)) : undefined),
  [creators, sCreatorId]
);
  const sCategories = sCreator?.categories ?? [];

  // Add state
  const [aName, setAName] = useState('');
  const [cAgencyId, setCAgencyId] = useState<number | ''>('');
  const [cStage, setCStage] = useState('');
  const [cCats, setCCats] = useState(''); // comma-sep
  const [asAgencyId, setAsAgencyId] = useState<number | ''>('');
  const [asCreatorId, setAsCreatorId] = useState<number | ''>('');
  const [asDescription, setAsDescription] = useState('');
  const [asPrice, setAsPrice] = useState<number | ''>('');
  const [asCategory, setAsCategory] = useState('');
  const [asMediaType, setAsMediaType] = useState('');
  // Loading states for add actions
  const [creatingAgency, setCreatingAgency] = useState(false);
  const [creatingCreator, setCreatingCreator] = useState(false);
  const [creatingAsset, setCreatingAsset] = useState(false);
  // Feedback messages for add actions
  const [agencyMsg, setAgencyMsg] = useState<string | null>(null);
  const [creatorMsg, setCreatorMsg] = useState<string | null>(null);
  const [assetMsg, setAssetMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agency').then(r => r.json()).then(setAgencies);
    fetch('/api/creator').then(r => r.json()).then(setCreators);
    fetch('/api/assets').then(r => r.json()).then(setAssets);
  }, []);

  useEffect(() => {
    // keep creators filtered on Search tab when agency changes
    if (sAgencyId) {
      fetch(`/api/creator?agency_id=${sAgencyId}`).then(r => r.json()).then(setCreators);
      setSCreatorId('');
    }
  }, [sAgencyId]);

  useEffect(() => {
    // keep creators filtered on Add/Asset when agency changes
    if (asAgencyId) {
      fetch(`/api/creator?agency_id=${asAgencyId}`).then(r => r.json()).then(setCreators);
      setAsCreatorId('');
    }
  }, [asAgencyId]);

  const runSearch = async () => {
    if (!sAgencyId || !sCreatorId || !sQuery) return;
    setSearching(true);
    try {
      const body = {
        query: sQuery,
        agency_id: Number(sAgencyId),
        creator_id: Number(sCreatorId),
        category: sCategory || null,
        limit: sLimit
      };
      const res = await fetch('/api/search', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      const json = await res.json();
      setResults(json.results || []);
    } finally {
      setSearching(false);
    }
  };

  const createAgency = async () => {
    if (!aName) return;
    setCreatingAgency(true);
    setAgencyMsg(null);
    try {
      const res = await fetch('/api/agency', { method: 'POST', body: JSON.stringify({ name: aName }), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const ag = await res.json();
        setAgencies(prev => [...prev, ag]);
        setAName('');
        setAgencyMsg('Agency created successfully!');
      } else {
        setAgencyMsg('Failed to create agency.');
      }
    } catch {
      setAgencyMsg('Failed to create agency.');
    } finally {
      setCreatingAgency(false);
    }
  };

  const createCreator = async () => {
    if (!cAgencyId || !cStage) return;
    setCreatingCreator(true);
    setCreatorMsg(null);
    try {
      const body = { agency_id: Number(cAgencyId), stage_name: cStage, categories: cCats };
      const res = await fetch('/api/creator', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        const cr = await res.json();
        setCreators(prev => [...prev, cr]);
        setCStage(''); setCCats('');
        setCreatorMsg('Creator created successfully!');
      } else {
        setCreatorMsg('Failed to create creator.');
      }
    } catch {
      setCreatorMsg('Failed to create creator.');
    } finally {
      setCreatingCreator(false);
    }
  };

  const createAsset = async () => {
    if (!asAgencyId || !asCreatorId || !asDescription || !asPrice || !asCategory) return;
    setCreatingAsset(true);
    setAssetMsg(null);
    try {
      const body = {
        description: asDescription,
        price: Number(asPrice),
        category: asCategory,
        media_type: asMediaType || null,
        agency_id: Number(asAgencyId),
        creator_id: Number(asCreatorId)
      };
      const res = await fetch('/api/assets', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setAsDescription(''); setAsPrice(''); setAsCategory(''); setAsMediaType('');
        // refresh asset list
        const data = await (await fetch('/api/assets')).json();
        setAssets(data);
        setAssetMsg('Asset created successfully!');
      } else {
        setAssetMsg('Failed to create asset.');
      }
    } catch {
      setAssetMsg('Failed to create asset.');
    } finally {
      setCreatingAsset(false);
    }
  };

  // Clear messages on input change (must be inside component, not inside JSX)


  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 32, fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc', borderRadius: 16, boxShadow: '0 4px 24px #0001' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24, fontWeight: 700, letterSpacing: -1, color: '#1e293b', textAlign: 'center' }}>RAG Demo Dashboard</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
        <button onClick={() => setTab('search')} style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: tab==='search' ? '#2563eb':'#e0e7ef', color: tab==='search' ? '#fff':'#1e293b', fontWeight: 600, fontSize: 16, boxShadow: tab==='search' ? '0 2px 8px #2563eb33':'none', transition: 'all 0.2s' }}>Search</button>
        <button onClick={() => setTab('add')} style={{ padding: '10px 28px', border: 'none', borderRadius: 8, background: tab==='add' ? '#2563eb':'#e0e7ef', color: tab==='add' ? '#fff':'#1e293b', fontWeight: 600, fontSize: 16, boxShadow: tab==='add' ? '0 2px 8px #2563eb33':'none', transition: 'all 0.2s' }}>Add</button>
      </div>

      {tab === 'search' && (
        <section>
          <h2 style={{ fontSize: 22, marginBottom: 16, color: '#2563eb', fontWeight: 600 }}>Search</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 18 }}>
            <div>
              <label style={{ fontWeight: 500, color: '#334155' }}>Agency</label>
              <select value={sAgencyId} onChange={e => setSAgencyId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}>
                <option value="">Select agency</option>
                {agencies.map(a => <option key={a.agency_id} value={a.agency_id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 500, color: '#334155' }}>Creator</label>
              <select value={sCreatorId} onChange={e => setSCreatorId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }} disabled={!sAgencyId}>
                <option value="">Select creator</option>
                {creators
                  .filter(c => !sAgencyId || c.agency_id === Number(sAgencyId))
                  .map(c => <option key={c.creator_id} value={c.creator_id}>{c.stage_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 500, color: '#334155' }}>Category (optional)</label>
              <select
                value={sCategory}
                onChange={e => setSCategory(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
                disabled={!sCreatorId || sCategories.length === 0}
              >
                <option value="">Select category</option>
                {sCategories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 500, color: '#334155' }}>Limit</label>
              <input type="number" value={sLimit} min={1} max={200} onChange={e => setSLimit(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }} />
            </div>
          </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'end', marginBottom: 8 }}>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Query</label>
                <input
                  value={sQuery}
                  onChange={e => setSQuery(e.target.value)}
                  placeholder="e.g. red dress in bathroom"
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && sAgencyId && sCreatorId && sQuery && !searching) {
                      runSearch();
                    }
                  }}
                  disabled={searching}
                />
              </div>
              <button
                onClick={runSearch}
                style={{ padding: '12px 28px', border: 'none', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #2563eb33', transition: 'all 0.2s', opacity: (!sAgencyId || !sCreatorId || !sQuery || searching) ? 0.5 : 1 }}
                disabled={!sAgencyId || !sCreatorId || !sQuery || searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

          <div style={{ marginTop: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2563eb', fontWeight: 600 }}>Results ({results.length})</h3>
            {searching ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#2563eb', fontWeight: 500 }}>Searching...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 10 }}>ID</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 10 }}>Description</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 10 }}>Category</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 10 }}>Media</th>
                      <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', padding: 10 }}>Price</th>
                      <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', padding: 10 }}>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: 10 }}>{r.id}</td>
                        <td style={{ padding: 10 }}>{r.description}</td>
                        <td style={{ padding: 10 }}>{r.category}</td>
                        <td style={{ padding: 10 }}>{r.media_type ?? ''}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>${r.price}</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>{r.distance.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'add' && (
        <section>
          <h2 style={{ fontSize: 22, margin: '8px 0 20px 0', color: '#2563eb', fontWeight: 600 }}>Add</h2>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18, marginBottom: 20 }}>
            <h3 style={{ color: '#334155', fontWeight: 600, marginBottom: 10 }}>Create Agency</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
              <input placeholder="Agency name" value={aName} onChange={e => setAName(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              <button onClick={createAgency} disabled={creatingAgency || !aName} style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: creatingAgency ? '#cbd5e1' : '#2563eb', color: '#fff', fontWeight: 600 }}>
                {creatingAgency ? 'Creating...' : 'Create'}
              </button>
              {agencyMsg && (
                <div style={{ marginTop: 8, color: agencyMsg.includes('success') ? 'green' : 'red', fontWeight: 500 }}>{agencyMsg}</div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18, marginBottom: 20 }}>
            <h3 style={{ color: '#334155', fontWeight: 600, marginBottom: 10 }}>Create Creator</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 10 }}>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Agency</label>
                <select value={cAgencyId} onChange={e => setCAgencyId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <option value="">Select agency</option>
                  {agencies.map(a => <option key={a.agency_id} value={a.agency_id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Stage Name</label>
                <input value={cStage} onChange={e => setCStage(e.target.value)} placeholder="Creator name" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
              <input
                value={cCats}
                onChange={e => setCCats(e.target.value)}
                placeholder="Categories (comma-separated)"
                style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
              />
              <button onClick={createCreator} disabled={creatingCreator || !cAgencyId || !cStage} style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: (creatingCreator || !cAgencyId || !cStage) ? '#cbd5e1' : '#2563eb', color: '#fff', fontWeight: 600 }}>
                {creatingCreator ? 'Creating...' : 'Create'}
              </button>
              {creatorMsg && (
                <div style={{ marginTop: 8, color: creatorMsg.includes('success') ? 'green' : 'red', fontWeight: 500 }}>{creatorMsg}</div>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
            <h3 style={{ color: '#334155', fontWeight: 600, marginBottom: 10 }}>Create Asset</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Agency</label>
                <select value={asAgencyId} onChange={e => setAsAgencyId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}>
                  <option value="">Select agency</option>
                  {agencies.map(a => <option key={a.agency_id} value={a.agency_id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Creator</label>
                <select value={asCreatorId} onChange={e => setAsCreatorId(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} disabled={!asAgencyId}>
                  <option value="">Select creator</option>
                  {creators
                    .filter(c => !asAgencyId || c.agency_id === Number(asAgencyId))
                    .map(c => <option key={c.creator_id} value={c.creator_id}>{c.stage_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Category</label>
                <select
                  value={asCategory}
                  onChange={e => setAsCategory(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                  disabled={!asCreatorId || (creators.find(c => c.creator_id === Number(asCreatorId))?.categories?.length === 0)}
                >
                  <option value="">Select category</option>
                  {(creators.find(c => c.creator_id === Number(asCreatorId))?.categories ?? []).map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Media Type (optional)</label>
                <input value={asMediaType} onChange={e => setAsMediaType(e.target.value)} placeholder="image or video" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Price</label>
                <input type="number" value={asPrice} onChange={e => setAsPrice(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ fontWeight: 500, color: '#334155' }}>Description</label>
                <textarea value={asDescription} onChange={e => setAsDescription(e.target.value)} rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc' }} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={createAsset} disabled={creatingAsset || !asAgencyId || !asCreatorId || !asDescription || !asPrice || !asCategory} style={{ padding: '12px 28px', border: 'none', borderRadius: 8, background: (creatingAsset || !asAgencyId || !asCreatorId || !asDescription || !asPrice || !asCategory) ? '#cbd5e1' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: 16 }}>
                {creatingAsset ? 'Creating...' : 'Create Asset'}
              </button>
              {assetMsg && (
                <div style={{ marginTop: 8, color: assetMsg.includes('success') ? 'green' : 'red', fontWeight: 500 }}>{assetMsg}</div>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <h4 style={{ color: '#2563eb', fontWeight: 600, marginBottom: 10 }}>Recent Assets</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 8 }}>ID</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 8 }}>Creator</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 8 }}>Category</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 8 }}>Media</th>
                      <th style={{ textAlign: 'right', borderBottom: '2px solid #e2e8f0', padding: 8 }}>Price</th>
                      <th style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', padding: 8 }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 20).map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: 8 }}>{a.id}</td>
                        <td style={{ padding: 8 }}>
                          {creators.find(c => c.creator_id === a.creator_id)?.stage_name ?? a.creator_id}
                        </td>
                        <td style={{ padding: 8 }}>{a.category}</td>
                        <td style={{ padding: 8 }}>{a.media_type ?? ''}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>${a.price}</td>
                        <td style={{ padding: 8 }}>{a.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}