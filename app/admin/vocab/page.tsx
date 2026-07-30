'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VocabTable } from './VocabTable';
import { BulkPasteDialog } from './BulkPasteDialog';
import { VocabMasterRow, VOCAB_MASTER_HEADERS } from '../../lib/vocab-schema';

type Status = 'loading' | 'authed' | 'unauthed' | 'error';

export default function AdminVocabPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [vocab, setVocab] = useState<VocabMasterRow[]>([]);
  const [wortCount, setWortCount] = useState(0);
  const [showBulk, setShowBulk] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  // Detect Bearer token in URL (?secret=...) so the admin page works without login
  const getAuthHeader = useCallback((): Record<string, string> => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('secret');
    return secret ? { Authorization: `Bearer ${secret}` } : {};
  }, []);

  const loadVocab = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/vocab/list', { headers: getAuthHeader() });
      if (res.status === 401) {
        setStatus('unauthed');
        return;
      }
      const json = await res.json();
      if (!json.ok) {
        setStatus('error');
        return;
      }
      setVocab(json.vocab);
      setWortCount(json.wortCount);
      setStatus('authed');
    } catch {
      setStatus('error');
    }
  }, [getAuthHeader]);

  useEffect(() => {
    loadVocab();
  }, [loadVocab]);

  const showFlash = (kind: 'ok' | 'err', msg: string) => {
    setFlash({ kind, msg });
    setTimeout(() => setFlash(null), 4000);
  };

  const handleSave = async (row: VocabMasterRow) => {
    const res = await fetch('/api/admin/vocab/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(row),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      showFlash('err', json.error || json.details?.join(', ') || 'save failed');
      return false;
    }
    showFlash('ok', `${json.action}: ${row.id}`);
    await loadVocab();
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete row ${id}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/vocab/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      showFlash('err', json.error || 'delete failed');
      return;
    }
    showFlash('ok', `deleted: ${id}`);
    await loadVocab();
  };

  const handleBulkInsert = async (tsv: string) => {
    const res = await fetch('/api/admin/vocab/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ tsv }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      showFlash('err', json.error || 'bulk insert failed');
      return;
    }
    showFlash('ok', `inserted ${json.inserted} rows at row ${json.firstRow}`);
    setShowBulk(false);
    await loadVocab();
  };

  const handleSeedWort = async (count: number) => {
    if (!confirm(`Add ${count} random vocab rows to wort_des_tages?`)) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/wort-des-tages/bulk-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ count }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showFlash('err', json.error || 'seed failed');
      } else {
        showFlash('ok', `seeded ${json.inserted} wort des tages entries`);
        await loadVocab();
      }
    } finally {
      setSeeding(false);
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <p>Loading admin…</p>
      </div>
    );
  }

  if (status === 'unauthed') {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 600 }}>
        <h1>🔒 Admin — Sign in or use Bearer token</h1>
        <p>This page requires authentication. Two options:</p>
        <ol>
          <li><a href="/login?next=/admin/vocab">Sign in</a></li>
          <li>Append <code>?secret=&lt;CRON_SECRET&gt;</code> to this URL</li>
        </ol>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <h1>⚠️ Error loading vocab</h1>
        <button onClick={loadVocab}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 1400, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>🛠 Vocab Admin</h1>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: 13 }}>
            {vocab.length} rows · {wortCount} wort des tages
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowBulk(true)}
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
          >
            📋 Bulk Paste TSV
          </button>
          <button
            onClick={() => handleSeedWort(30)}
            disabled={seeding}
            style={{ padding: '8px 16px', border: '1px solid #4f46e5', borderRadius: 6, background: '#4f46e5', color: '#fff', cursor: 'pointer' }}
          >
            {seeding ? '…seeding' : '🌱 Seed 30 wort des tages'}
          </button>
          <button
            onClick={() => router.push('/woerter')}
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
          >
            ← Wörter
          </button>
        </div>
      </header>

      {flash && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: 12,
            borderRadius: 6,
            background: flash.kind === 'ok' ? '#d1fae5' : '#fee2e2',
            color: flash.kind === 'ok' ? '#065f46' : '#991b1b',
            fontSize: 14,
          }}
        >
          {flash.msg}
        </div>
      )}

      <VocabTable vocab={vocab} onSave={handleSave} onDelete={handleDelete} headers={VOCAB_MASTER_HEADERS} />

      {showBulk && (
        <BulkPasteDialog
          onClose={() => setShowBulk(false)}
          onSubmit={handleBulkInsert}
          headers={VOCAB_MASTER_HEADERS}
        />
      )}
    </div>
  );
}
