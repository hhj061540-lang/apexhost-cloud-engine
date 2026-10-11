import React, { useState } from 'react';
import { 
  Database, Plus, Trash2, Eye, Download, Copy, Check, Table, 
  Terminal, Sparkles, Filter, X
} from 'lucide-react';
import { DatabaseTable, DomainItem } from '../../types';

interface DatabaseManagerProps {
  domain: DomainItem;
  onUpdateDomain: (updated: DomainItem) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  domain,
  onUpdateDomain,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>(
    domain.database[0]?.id || ''
  );

  // New table form
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [newColumnsInput, setNewColumnsInput] = useState('id, name, value, created_at');

  // New row form
  const [isInsertingRow, setIsInsertingRow] = useState(false);
  const [newRowValues, setNewRowValues] = useState<Record<string, string>>({});

  // Raw DB modal
  const [showRawDbModal, setShowRawDbModal] = useState(false);
  const [copiedRawDb, setCopiedRawDb] = useState(false);

  const activeTable = domain.database.find(t => t.id === selectedTableId) || domain.database[0];

  // Create Table
  const handleCreateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTableName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanName) return;

    const cols = newColumnsInput
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (cols.length === 0) cols.push('id', 'name');

    const newTbl: DatabaseTable = {
      id: `tbl-${Date.now()}`,
      name: cleanName,
      description: newTableDesc.trim() || 'Custom application table',
      columns: cols,
      rows: [
        {
          id: '1',
          ...Object.fromEntries(cols.slice(1).map(c => [c, `sample_${c}_val`])),
        },
      ],
      createdAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString(),
    };

    const updatedDb = [...domain.database, newTbl];
    onUpdateDomain({
      ...domain,
      database: updatedDb,
    });

    setSelectedTableId(newTbl.id);
    setIsCreatingTable(false);
    setNewTableName('');
    setNewTableDesc('');
  };

  // Delete Table
  const handleDeleteTable = (tableId: string) => {
    const updated = domain.database.filter(t => t.id !== tableId);
    onUpdateDomain({
      ...domain,
      database: updated,
    });
    if (selectedTableId === tableId) {
      setSelectedTableId(updated[0]?.id || '');
    }
  };

  // Insert Row
  const handleInsertRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTable) return;

    const newRow = {
      id: (activeTable.rows.length + 1).toString(),
      ...newRowValues,
    };

    const updatedTables = domain.database.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: [...t.rows, newRow],
          updatedAt: new Date().toLocaleTimeString(),
        };
      }
      return t;
    });

    onUpdateDomain({
      ...domain,
      database: updatedTables,
    });

    setIsInsertingRow(false);
    setNewRowValues({});
  };

  // Delete Row
  const handleDeleteRow = (rowId: string) => {
    if (!activeTable) return;
    const updatedTables = domain.database.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.filter(r => r.id !== rowId),
          updatedAt: new Date().toLocaleTimeString(),
        };
      }
      return t;
    });

    onUpdateDomain({
      ...domain,
      database: updatedTables,
    });
  };

  // Copy raw database
  const handleCopyRawDb = () => {
    navigator.clipboard.writeText(JSON.stringify(domain.database, null, 2));
    setCopiedRawDb(true);
    setTimeout(() => setCopiedRawDb(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Virtual Database (SQLite & JSON Store)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured relational and JSON data store accessible to scripts and APIs on Port {domain.port}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawDbModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Open Raw DB Contents</span>
          </button>

          <button
            onClick={() => setIsCreatingTable(true)}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Table</span>
          </button>
        </div>
      </div>

      {/* Main Database Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        {/* Left: Tables List */}
        <div className="lg:col-span-3 space-y-2 border-r border-slate-800/80 pr-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <span>Tables ({domain.database.length})</span>
          </div>

          <div className="space-y-1">
            {domain.database.map(tbl => {
              const isSelected = activeTable?.id === tbl.id;
              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTableId(tbl.id)}
                  className={`p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Table className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">{tbl.name}</div>
                      <div className="text-[10px] text-slate-500">{tbl.rows.length} rows</div>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteTable(tbl.id);
                    }}
                    title="Delete Table"
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {domain.database.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No tables yet. Click "New Table" to create one.
            </div>
          )}
        </div>

        {/* Right: Table View & Rows */}
        <div className="lg:col-span-9 space-y-4">
          {activeTable ? (
            <>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-white">{activeTable.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {activeTable.rows.length} records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeTable.description}</p>
                </div>

                <button
                  onClick={() => {
                    const emptyVals: Record<string, string> = {};
                    activeTable.columns.forEach(col => {
                      if (col !== 'id') emptyVals[col] = '';
                    });
                    setNewRowValues(emptyVals);
                    setIsInsertingRow(true);
                  }}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Row</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-900/60">
                      {activeTable.columns.map(col => (
                        <th key={col} className="p-3 font-semibold">{col}</th>
                      ))}
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeTable.rows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-900/40 text-slate-300">
                        {activeTable.columns.map(col => (
                          <td key={col} className="p-3 max-w-[200px] truncate">
                            {row[col] !== undefined ? String(row[col]) : '-'}
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 hover:text-rose-400 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Select or create a table to view database rows.
            </div>
          )}
        </div>
      </div>

      {/* CREATE TABLE MODAL */}
      {isCreatingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg">Create Database Table</h3>
              <button onClick={() => setIsCreatingTable(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTableSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Name</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  placeholder="e.g. products, users, sessions"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newTableDesc}
                  onChange={e => setNewTableDesc(e.target.value)}
                  placeholder="e.g. Stores customer profiles and subscriptions"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Columns <span className="text-slate-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={newColumnsInput}
                  onChange={e => setNewColumnsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingTable(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSERT ROW MODAL */}
      {isInsertingRow && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg">Insert Row into {activeTable.name}</h3>
              <button onClick={() => setIsInsertingRow(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInsertRowSubmit} className="space-y-3">
              {activeTable.columns
                .filter(col => col !== 'id')
                .map(col => (
                  <div key={col}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">{col}</label>
                    <input
                      type="text"
                      value={newRowValues[col] || ''}
                      onChange={e => setNewRowValues({ ...newRowValues, [col]: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                ))}

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInsertingRow(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAW DB CONTENTS MODAL */}
      {showRawDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold font-mono text-emerald-400">Raw Database JSON Store</h3>
                <p className="text-xs text-slate-400">Complete raw table state for {domain.name}</p>
              </div>
              <button onClick={() => setShowRawDbModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-[400px] select-all">
              {JSON.stringify(domain.database, null, 2)}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">SQLite / JSON Virtual Engine</span>
              <button
                onClick={handleCopyRawDb}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5"
              >
                {copiedRawDb ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRawDb ? 'Copied' : 'Copy Raw JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
