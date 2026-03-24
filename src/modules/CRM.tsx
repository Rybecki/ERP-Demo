import React, { useMemo, useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, MessageSquare, ExternalLink } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Customer } from '../types';
import { generateId, getCustomers, saveCustomers } from '../lib/storage';
import { Modal } from '../components/Modal';

export const CRMModule = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const persist = (next: Customer[]) => {
    setCustomers(next);
    saveCustomers(next);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, searchTerm]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const c: Customer = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '—',
      address: address.trim() || '—',
      totalOrders: 0,
      lastOrderDate: undefined,
    };
    persist([...customers, c]);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers (CRM)</h1>
          <p className="text-muted-foreground">Relationships, history, and contact data.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add customer
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-accent/5">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, email, or phone…"
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/30 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Contact</th>
                <th className="text-left px-6 py-4">Address</th>
                <th className="text-center px-6 py-4">Orders</th>
                <th className="text-right px-6 py-4">Last order</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-accent/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-bold">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={12} className="text-primary shrink-0" /> {customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={12} className="text-primary shrink-0" /> {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground max-w-[200px] truncate">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary shrink-0" /> {customer.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-accent px-2 py-1 rounded-lg font-bold text-xs">{customer.totalOrders}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-medium">{customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="Message">
                        <MessageSquare size={16} />
                      </button>
                      <button type="button" className="p-2 hover:bg-accent text-foreground rounded-lg transition-colors" title="Open">
                        <ExternalLink size={16} />
                      </button>
                    </div>
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
        title="Add customer"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-customer-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-customer-form" className="space-y-3" onSubmit={handleAdd}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Company / name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
        </form>
      </Modal>
    </div>
  );
};
