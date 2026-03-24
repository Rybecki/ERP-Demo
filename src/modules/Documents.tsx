import React, { useMemo, useRef, useState } from 'react';
import { FileText, Plus, Search, Download, Trash2, File, FileImage, FileCode } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { StoredDocument } from '../types';
import { generateId, getDocuments, saveDocuments, formatFileSize } from '../lib/storage';

const CATEGORIES = ['All', 'Invoices', 'Contracts', 'Reports', 'Warehouse', 'HR', 'Other'] as const;

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'pdf':
      return <FileText className="text-rose-500" size={24} />;
    case 'image':
      return <FileImage className="text-blue-500" size={24} />;
    case 'excel':
      return <FileCode className="text-emerald-500" size={24} />;
    default:
      return <File className="text-muted-foreground" size={24} />;
  }
};

function detectType(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpe?g|gif|webp)$/i.test(n)) return 'image';
  if (/\.(xlsx?|csv)$/i.test(n)) return 'excel';
  if (/\.(docx?|txt)$/i.test(n)) return 'doc';
  return 'file';
}

export const DocumentsModule = () => {
  const [docs, setDocs] = useState<StoredDocument[]>(() => getDocuments());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>('All');
  const fileRef = useRef<HTMLInputElement>(null);

  const persist = (next: StoredDocument[]) => {
    setDocs(next);
    saveDocuments(next);
  };

  const filtered = useMemo(() => {
    let list = docs;
    if (activeCat !== 'All') list = list.filter((d) => d.category === activeCat);
    const q = searchTerm.trim().toLowerCase();
    if (q) list = list.filter((d) => d.name.toLowerCase().includes(q));
    return list;
  }, [docs, activeCat, searchTerm]);

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const doc: StoredDocument = {
        id: generateId(),
        name: file.name,
        type: detectType(file),
        sizeLabel: formatFileSize(file.size),
        date: new Date().toISOString().slice(0, 10),
        category: activeCat === 'All' ? 'Other' : activeCat,
        dataUrl,
      };
      persist([doc, ...docs]);
    };
    reader.readAsDataURL(file);
  };

  const download = (d: StoredDocument) => {
    if (!d.dataUrl) {
      alert('This demo row has no file bytes. Upload a new file to download.');
      return;
    }
    const a = document.createElement('a');
    a.href = d.dataUrl;
    a.download = d.name;
    a.click();
  };

  const remove = (id: string) => {
    if (!confirm('Delete this document from storage?')) return;
    persist(docs.filter((d) => d.id !== id));
  };

  const usedBytesApprox = docs.reduce((acc, d) => acc + (d.dataUrl ? d.dataUrl.length * 0.75 : 0), 0);
  const cap = 5 * 1024 * 1024 * 1024;
  const pct = Math.min(100, (usedBytesApprox / cap) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Files are stored in your browser (localStorage).</p>
        </div>
        <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
        <button
          type="button"
          onClick={onPickFile}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Upload file
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(cat)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    cat === activeCat ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent text-muted-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">Uploads use the selected category (defaults to Other when All is selected).</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4">Storage (estimate)</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Used ~{formatFileSize(usedBytesApprox)}</span>
                <span>of 5 GB cap</span>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search documents…"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-accent/30 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                    <th className="text-left px-6 py-4">File name</th>
                    <th className="text-left px-6 py-4">Category</th>
                    <th className="text-left px-6 py-4">Date</th>
                    <th className="text-right px-6 py-4">Size</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-accent/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileIcon type={doc.type} />
                          <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-accent px-2 py-1 rounded-lg text-xs">{doc.category}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(doc.date)}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">{doc.sizeLabel}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => download(doc)}
                            disabled={!doc.dataUrl}
                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors disabled:opacity-40"
                            title={doc.dataUrl ? 'Download' : 'No file data'}
                          >
                            <Download size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(doc.id)}
                            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
