import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn, formatCurrency } from '../lib/utils';
import { getOrders, getProducts, getCustomers, getEmployees } from '../lib/storage';

const salesData = [
  { name: 'Mar 1', value: 4500 },
  { name: 'Mar 5', value: 5200 },
  { name: 'Mar 10', value: 4800 },
  { name: 'Mar 15', value: 6100 },
  { name: 'Mar 20', value: 5900 },
  { name: 'Mar 25', value: 7200 },
  { name: 'Mar 30', value: 8500 },
];

const categoryData = [
  { name: 'Electronics', value: 400, color: '#6366f1' },
  { name: 'Furniture', value: 300, color: '#10b981' },
  { name: 'Tools', value: 200, color: '#f59e0b' },
  { name: 'Other', value: 100, color: '#ef4444' },
];

const StatCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
}) => (
  <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-primary/10 text-primary rounded-xl">
        <Icon size={24} />
      </div>
      <div
        className={cn(
          'flex items-center text-xs font-bold px-2 py-1 rounded-full',
          trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        )}
      >
        {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {change}
      </div>
    </div>
    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
  </div>
);

const Widget = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('bg-card border border-border rounded-2xl p-6 shadow-sm', className)}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-bold text-lg tracking-tight">{title}</h3>
      <button type="button" className="text-xs text-primary font-semibold hover:underline flex items-center">
        View all <ArrowUpRight size={14} className="ml-1" />
      </button>
    </div>
    {children}
  </div>
);

export const Dashboard = () => {
  const orders = getOrders();
  const products = getProducts();
  const customers = getCustomers();
  const employees = getEmployees();

  const orderTotal = useMemo(() => orders.reduce((s, o) => s + o.totalAmount, 0), [orders]);
  const lowStock = useMemo(() => products.filter((p) => p.stock <= p.minStock).length, [products]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [orders]);

  const statusLabel: Record<string, string> = {
    new: 'New',
    processing: 'Processing',
    shipped: 'Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const statusColor: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-500',
    processing: 'bg-amber-500/10 text-amber-500',
    shipped: 'bg-purple-500/10 text-purple-500',
    completed: 'bg-emerald-500/10 text-emerald-500',
    cancelled: 'bg-rose-500/10 text-rose-500',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here is what is happening in your company today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card border border-border px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Live data from localStorage
          </div>
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            Generate report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Open orders value" value={formatCurrency(orderTotal)} change="+12.5%" trend="up" icon={ShoppingCart} />
        <StatCard title="Orders count" value={String(orders.length)} change="+8.2%" trend="up" icon={Package} />
        <StatCard title="Customers" value={String(customers.length)} change="CRM" trend="up" icon={Users} />
        <StatCard title="Employees" value={String(employees.length)} change="HR" trend="up" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Widget title="Sales trend (sample)" className="lg:col-span-2">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Sales by category (sample)">
          <div className="flex flex-col h-full">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-6">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value} k</span>
                </div>
              ))}
            </div>
          </div>
        </Widget>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Alerts">
          <div className="space-y-4">
            {lowStock > 0 && (
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
                <div className="p-2 rounded-lg shrink-0 bg-amber-500/10 text-amber-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Low stock</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{lowStock} product(s) at or below minimum. Open Warehouse.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
              <div className="p-2 rounded-lg shrink-0 bg-blue-500/10 text-blue-500">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Fleet</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Check inspection and insurance dates in Fleet.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors border border-transparent hover:border-border">
              <div className="p-2 rounded-lg shrink-0 bg-blue-500/10 text-blue-500">
                <ShoppingCart size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Orders</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{orders.length} orders stored locally.</p>
              </div>
            </div>
          </div>
        </Widget>

        <Widget title="Latest orders">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-3 font-medium">Number</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 font-medium">{order.orderNumber}</td>
                    <td className="py-3 truncate max-w-[140px]">{order.customerName}</td>
                    <td className="py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', statusColor[order.status])}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>
      </div>
    </div>
  );
};
