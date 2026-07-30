'use client';

import { useState } from 'react';

export function BulkPasteDialog({
  onClose,
  onSubmit,
  headers,
}: {
  onClose: () => void;
  onSubmit: (tsv: string) => Promise<void>;
  headers: string[];
}) {
  const [tsv, setTsv] = useState<string>(headers.join('\t'));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          maxWidth: 800,
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Bulk Paste TSV</h2>
        <p style={{ color: '#666', fontSize: 13 }}>
          Paste tab-separated values. First row must be header. Empty <code>id</code> cells auto-generate as <code>{`{pos}-NNNN`}</code>.
          Available columns: {headers.join(', ')}
        </p>
        <textarea
          value={tsv}
          onChange={(e) => setTsv(e.target.value)}
          style={{
            width: '100%',
            minHeight: 280,
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 12,
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 6,
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        />
        <p style={{ fontSize: 12, color: '#666' }}>
          Rows: {Math.max(0, tsv.split('\n').filter((l) => l.trim().length > 0).length - 1)}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(tsv)}
            style={{ padding: '8px 16px', border: '1px solid #4f46e5', background: '#4f46e5', color: '#fff', borderRadius: 6, cursor: 'pointer' }}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
