import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { Order } from '../types';
import { generateId, getOrders, saveOrders } from '../lib/storage';
import { Modal } from '../components/Modal';

const statusMap = {
  new: { label: 'New', color: 'bg-blue-500/10 text-blue-500' },
  processing: { label: 'Processing', color: 'bg-amber-500/10 text-amber-500' },
  shipped: { label: 'Shipped', color: 'bg-purple-500/10 text-purple-500' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-500' },
};

const PAGE_SIZE = 6;

export const OrdersModule = () => {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [page, setPage] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const [formCustomer, setFormCustomer] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState<Order['status']>('new');

  const persist = (next: Order[]) => {
    setOrders(next);
    saveOrders(next);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((o) => {
      const matchQ =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || o.status === statusFilter;
      return matchQ && matchS;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const slice = filtered.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE);

  const nextOrderNumber = () => {
    let max = 0;
    for (const o of orders) {
      const m = o.orderNumber.match(/(\d+)\s*$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    const n = max + 1;
    return `ORD-2024-${String(n).padStart(3, '0')}`;
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formAmount.replace(',', '.'));
    if (!formCustomer.trim() || Number.isNaN(amount)) return;
    const newOrder: Order = {
      id: generateId(),
      orderNumber: nextOrderNumber(),
      customerId: generateId(),
      customerName: formCustomer.trim(),
      status: formStatus,
      totalAmount: amount,
      createdAt: new Date().toISOString(),
      items: [],
    };
    persist([newOrder, ...orders]);
    setFormCustomer('');
    setFormAmount('');
    setFormStatus('new');
    setAddOpen(false);
    setPage(0);
  };

  const deleteOrder = (id: string) => {
    if (!confirm('Delete this order?')) return;
    persist(orders.filter((o) => o.id !== id));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nexus-orders.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage sales and fulfillment.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New order
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-accent/5">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by number or customer…"
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex flex-wrap gap-1">
              {(['all', 'new', 'processing', 'shipped', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(0);
                  }}
                  className={cn(
                    'px-2 py-1 rounded-lg text-xs font-bold capitalize',
                    statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-background border border-border hover:bg-accent'
                  )}
                >
                  {s === 'all' ? 'All' : statusMap[s].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
              title="Filters are the status chips above"
            >
              <Filter size={18} /> Filters
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
            >
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/30 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <th className="text-left px-6 py-4">Number</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Total</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slice.map((order) => (
                <tr key={order.id} className="hover:bg-accent/20 transition-colors group">
                  <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-medium">{order.customerName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        statusMap[order.status].color
                      )}
                    >
                      {statusMap[order.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setDetailOrder(order)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = prompt('New status: new | processing | shipped | completed | cancelled', order.status);
                          if (!next) return;
                          const st = next.trim().toLowerCase() as Order['status'];
                          if (!['new', 'processing', 'shipped', 'completed', 'cancelled'].includes(st)) return;
                          persist(orders.map((o) => (o.id === order.id ? { ...o, status: st } : o)));
                        }}
                        className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors"
                        title="Edit status"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button type="button" className="p-2 hover:bg-accent rounded-lg text-muted-foreground" title="More">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 bg-accent/5">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : pageSafe * PAGE_SIZE + 1}-
            {Math.min((pageSafe + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"
              disabled={pageSafe <= 0}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium',
                  i === pageSafe ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"
              disabled={pageSafe >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New order"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-order-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save order
            </button>
          </>
        }
      >
        <form id="add-order-form" className="space-y-4" onSubmit={handleAddOrder}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Customer name</label>
            <input
              required
              value={formCustomer}
              onChange={(e) => setFormCustomer(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Total amount (USD)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as Order['status'])}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
            >
              {(Object.keys(statusMap) as Order['status'][]).map((s) => (
                <option key={s} value={s}>
                  {statusMap[s].label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={detailOrder?.orderNumber ?? 'Order'}>
        {detailOrder && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Customer:</span> {detailOrder.customerName}
            </p>
            <p>
              <span className="text-muted-foreground">Total:</span> {formatCurrency(detailOrder.totalAmount)}
            </p>
            <p>
              <span className="text-muted-foreground">Status:</span> {statusMap[detailOrder.status].label}
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span> {formatDate(detailOrder.createdAt)}
            </p>
            <p className="text-muted-foreground text-xs">Line items: {detailOrder.items.length ? JSON.stringify(detailOrder.items) : 'None (add line items in a future version)'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
