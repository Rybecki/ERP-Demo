import React, { useMemo, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { FinanceRecord } from '../types';
import { generateId, getFinanceRecords, saveFinanceRecords } from '../lib/storage';
import { Modal } from '../components/Modal';

const chartDemo = [
  { name: 'Jan', income: 45000, expenses: 32000 },
  { name: 'Feb', income: 52000, expenses: 38000 },
  { name: 'Mar', income: 48000, expenses: 41000 },
  { name: 'Apr', income: 61000, expenses: 45000 },
  { name: 'May', income: 59000, expenses: 42000 },
  { name: 'Jun', income: 72000, expenses: 51000 },
];

export const FinanceModule = () => {
  const [records, setRecords] = useState<FinanceRecord[]>(() => getFinanceRecords());
  const [addOpen, setAddOpen] = useState(false);
  const [type, setType] = useState<FinanceRecord['type']>('income');
  const [category, setCategory] = useState('Sales');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  const persist = (next: FinanceRecord[]) => {
    setRecords(next);
    saveFinanceRecords(next);
  };

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const r of records) {
      if (r.type === 'income') income += r.amount;
      else expense += r.amount;
    }
    return { income, expense, net: income - expense };
  }, [records]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount.replace(',', '.'));
    if (Number.isNaN(a) || a <= 0 || !description.trim()) return;
    const rec: FinanceRecord = {
      id: generateId(),
      type,
      category: category.trim() || 'General',
      amount: a,
      date,
      description: description.trim(),
      status,
    };
    persist([rec, ...records]);
    setAmount('');
    setDescription('');
    setAddOpen(false);
  };

  const exportCsv = () => {
    const header = 'date,description,category,type,amount,status\n';
    const rows = records
      .map((r) =>
        [r.date, `"${r.description.replace(/"/g, '""')}"`, r.category, r.type, r.amount, r.status ?? 'paid'].join(',')
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nexus-finance.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sorted = useMemo(() => [...records].sort((a, b) => b.date.localeCompare(a.date)), [records]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Income, expenses, and cash flow (stored locally).</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="bg-accent text-accent-foreground px-4 py-3 rounded-xl font-bold hover:bg-accent/80 transition-all flex items-center gap-2"
          >
            <Download size={20} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Add transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium">Income (all saved)</h3>
          <p className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(totals.income)}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
              <TrendingDown size={24} />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium">Expenses (all saved)</h3>
          <p className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(totals.expense)}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Wallet size={24} />
            </div>
          </div>
          <h3 className="text-muted-foreground text-sm font-medium">Net (saved records)</h3>
          <p className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(totals.net)}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6">Income vs expenses (demo trend)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDemo}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '12px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '4px' }}
              />
              <Legend verticalAlign="top" align="right" height={36} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Transactions</h3>
          <button type="button" onClick={() => setAddOpen(true)} className="text-sm text-primary font-bold hover:underline">
            Add transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/30 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Description</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-right px-6 py-4">Amount</th>
                <th className="text-right px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((tx) => (
                <tr key={tx.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4 font-medium">{tx.description}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="bg-accent px-2 py-1 rounded-lg">{tx.category}</span>
                  </td>
                  <td
                    className={cn(
                      'px-6 py-4 text-right font-bold',
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    )}
                  >
                    {tx.type === 'income' ? <ArrowUpRight size={14} className="inline mr-1" /> : <ArrowDownRight size={14} className="inline mr-1" />}
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const next = tx.status === 'paid' ? 'pending' : 'paid';
                        persist(records.map((r) => (r.id === tx.id ? { ...r, status: next } : r)));
                      }}
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-80',
                        (tx.status ?? 'paid') === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      )}
                    >
                      {(tx.status ?? 'paid') === 'paid' ? 'Paid' : 'Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add transaction"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-finance-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-finance-form" className="space-y-3" onSubmit={handleAdd}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as FinanceRecord['type'])} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Amount (USD)</label>
              <input required type="number" step="0.01" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <input required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'paid' | 'pending')} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20">
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
