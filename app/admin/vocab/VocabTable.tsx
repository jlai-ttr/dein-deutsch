'use client';

import { useState, useMemo } from 'react';
import { VocabMasterRow } from '../../lib/vocab-schema';

const PAGE_SIZE = 25;
const VISIBLE_COLS = ['id', 'level', 'de', 'pos', 'en', 'gender', 'plural', 'verb_praeteritum', 'verb_partizip_ii', 'example_de'];

export function VocabTable({
  vocab,
  onSave,
  onDelete,
}: {
  vocab: VocabMasterRow[];
  onSave: (row: VocabMasterRow) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
  headers: string[];
}) {
  const [filterPos, setFilterPos] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VocabMasterRow | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return vocab.filter((r) => {
      if (filterPos !== 'all' && r.pos !== filterPos) return false;
      if (filterLevel !== 'all' && r.level !== filterLevel) return false;
      if (s && !(`${r.de} ${r.en} ${r.id}`.toLowerCase().includes(s))) return false;
      return true;
    });
  }, [vocab, filterPos, filterLevel, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const startEdit = (row: VocabMasterRow) => {
    setEditingId(row.id);
    setDraft({ ...row });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveDraft = async () => {
    if (!draft) return;
    setSavingId(draft.id);
    try {
      const ok = await onSave(draft);
      if (ok) cancelEdit();
    } finally {
      setSavingId(null);
    }
  };

  const addNew = () => {
    const pos = filterPos !== 'all' ? filterPos : 'noun';
    const nextId = `${pos}-${String(vocab.length + 1).padStart(4, '0')}`;
    const newRow: VocabMasterRow = {
      id: nextId,
      level: (filterLevel !== 'all' ? filterLevel : 'A1') as VocabMasterRow['level'],
      topic: 'starter',
      is_active: 'TRUE',
      de: '',
      pos: pos as VocabMasterRow['pos'],
      en: '',
      pronunciation: '',
      ipa: '',
      updated_at: new Date().toISOString().slice(0, 10),
    };
    setEditingId(newRow.id);
    setDraft(newRow);
  };

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search de/en/id…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, minWidth: 220 }}
        />
        <select value={filterPos} onChange={(e) => { setFilterPos(e.target.value); setPage(0); }} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6 }}>
          <option value="all">all pos</option>
          <option value="noun">noun</option>
          <option value="verb">verb</option>
          <option value="adjective">adjective</option>
          <option value="adverb">adverb</option>
        </select>
        <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(0); }} style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6 }}>
          <option value="all">all levels</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
        </select>
        <button
          onClick={addNew}
          style={{ padding: '6px 12px', border: '1px solid #16a34a', borderRadius: 6, background: '#16a34a', color: '#fff', cursor: 'pointer' }}
        >
          + Add row
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#666' }}>
          {filtered.length} rows · page {page + 1}/{totalPages}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {VISIBLE_COLS.map((c) => (
                <th key={c} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
                  {c}
                </th>
              ))}
              <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const isEditing = editingId === row.id;
              const data = isEditing && draft ? draft : row;
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {VISIBLE_COLS.map((col) => (
                    <td key={col} style={{ padding: '6px 10px', verticalAlign: 'top' }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={(data[col as keyof VocabMasterRow] as string) ?? ''}
                          onChange={(e) => setDraft({ ...(data as VocabMasterRow), [col]: e.target.value })}
                          style={{ width: '100%', padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
                        />
                      ) : (
                        <span>{(row[col as keyof VocabMasterRow] as string) || <span style={{ color: '#9ca3af' }}>—</span>}</span>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveDraft}
                          disabled={savingId === row.id}
                          style={{ marginRight: 4, padding: '4px 10px', border: '1px solid #16a34a', background: '#16a34a', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          {savingId === row.id ? '…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ padding: '4px 10px', border: '1px solid #ccc', background: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(row)}
                          style={{ marginRight: 4, padding: '4px 10px', border: '1px solid #4f46e5', background: '#fff', color: '#4f46e5', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(row.id)}
                          style={{ padding: '4px 10px', border: '1px solid #dc2626', background: '#fff', color: '#dc2626', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          Del
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={VISIBLE_COLS.length + 1} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>no rows match filters</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
        >
          ← Prev
        </button>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
