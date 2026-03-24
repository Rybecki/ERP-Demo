import React, { useMemo, useState } from 'react';
import { Search, Plus, Package, MapPin, AlertCircle, History, QrCode } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Product } from '../types';
import { generateId, getProducts, saveProducts } from '../lib/storage';
import { Modal } from '../components/Modal';

export const WarehouseModule = () => {
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [searchTerm, setSearchTerm] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

  const persist = (next: Product[]) => {
    setProducts(next);
    saveProducts(next);
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  const moves = [
    { id: 1, type: 'in' as const, product: 'Dell laptop', qty: 5, date: '10:30' },
    { id: 2, type: 'out' as const, product: 'LG monitor', qty: 2, date: '09:15' },
    { id: 3, type: 'out' as const, product: 'Samsung SSD', qty: 10, date: 'Yesterday' },
  ];

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(stock, 10);
    const m = parseInt(minStock, 10);
    const pr = parseFloat(price.replace(',', '.'));
    if (!name.trim() || !sku.trim() || Number.isNaN(s) || Number.isNaN(m) || Number.isNaN(pr)) return;
    const p: Product = {
      id: generateId(),
      name: name.trim(),
      sku: sku.trim(),
      stock: s,
      minStock: m,
      price: pr,
      location: location.trim() || '—',
      category: category.trim() || 'General',
      image: image.trim() || undefined,
    };
    persist([...products, p]);
    setName('');
    setSku('');
    setStock('');
    setMinStock('');
    setPrice('');
    setLocation('');
    setCategory('');
    setImage('');
    setAddOpen(false);
  };

  const restock = (id: string) => {
    const add = parseInt(prompt('How many units to add?', '1') || '0', 10);
    if (Number.isNaN(add) || add <= 0) return;
    persist(products.map((p) => (p.id === id ? { ...p, stock: p.stock + add } : p)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
          <p className="text-muted-foreground">Products, stock levels, and locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="bg-accent text-accent-foreground px-4 py-3 rounded-xl font-bold hover:bg-accent/80 transition-all flex items-center gap-2"
          >
            <QrCode size={20} /> Scan code
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Add product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, SKU, or category…"
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl text-sm focus:ring-2 ring-primary/20 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
                <div className="flex gap-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-border bg-accent/50 flex items-center justify-center text-muted-foreground">
                      <Package size={28} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm truncate pr-2">{product.name}</h3>
                      <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-mono text-muted-foreground">{product.sku}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-primary">{formatCurrency(product.price)}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Stock</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          product.stock <= product.minStock ? 'text-rose-500' : 'text-foreground'
                        )}
                      >
                        {product.stock} pcs
                      </span>
                      {product.stock <= product.minStock && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Location</span>
                    <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                      <MapPin size={12} className="text-primary" />
                      {product.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" /> Low stock
            </h3>
            <div className="space-y-4">
              {products.filter((p) => p.stock <= p.minStock).length === 0 ? (
                <p className="text-sm text-muted-foreground">All products above minimum.</p>
              ) : (
                products
                  .filter((p) => p.stock <= p.minStock)
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Short by: {p.minStock - p.stock} pcs</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => restock(p.id)}
                        className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shrink-0"
                        title="Add stock"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <History size={18} className="text-primary" /> Recent moves
            </h3>
            <div className="space-y-4">
              {moves.map((move) => (
                <div key={move.id} className="flex items-center gap-3 text-sm">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      move.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    )}
                  >
                    {move.type === 'in' ? <Plus size={14} /> : <Package size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{move.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {move.type === 'in' ? 'Inbound' : 'Outbound'}: {move.qty} pcs
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{move.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add product"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-product-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-product-form" className="space-y-3" onSubmit={handleAddProduct}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">SKU</label>
            <input required value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Stock</label>
              <input required type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Min stock</label>
              <input required type="number" min={0} value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Price (USD)</label>
            <input required type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Image URL (optional)</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="/file.png or https://…" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
        </form>
      </Modal>

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Scan code">
        <p className="text-sm text-muted-foreground mb-3">Enter a SKU to find or highlight a product (demo).</p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const code = String(fd.get('code') || '').trim();
            if (!code) return;
            setSearchTerm(code);
            setScanOpen(false);
          }}
        >
          <input name="code" className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm" placeholder="SKU" />
          <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            Search
          </button>
        </form>
      </Modal>
    </div>
  );
};
