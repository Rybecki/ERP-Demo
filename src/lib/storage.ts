import type {
  Order,
  Product,
  Vehicle,
  Employee,
  Customer,
  Task,
  FinanceRecord,
  LeaveRequest,
  StoredDocument,
  CompanySettings,
} from '../types';

const PREFIX = 'nexuserp_v1';

const K = {
  orders: `${PREFIX}_orders`,
  products: `${PREFIX}_products`,
  vehicles: `${PREFIX}_vehicles`,
  employees: `${PREFIX}_employees`,
  customers: `${PREFIX}_customers`,
  tasks: `${PREFIX}_tasks`,
  finance: `${PREFIX}_finance`,
  leaveRequests: `${PREFIX}_leave`,
  documents: `${PREFIX}_documents`,
  company: `${PREFIX}_company`,
  search: `${PREFIX}_search`,
  menuLayout: `${PREFIX}_menuLayout`,
} as const;

export type MenuLayout = 'sidebar' | 'top';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const DEFAULT_ORDERS: Order[] = [
  { id: '1', orderNumber: 'ORD-2024-001', customerId: 'c1', customerName: 'Tech Solutions LLC', status: 'new', totalAmount: 4500, createdAt: '2024-03-10T10:00:00Z', items: [] },
  { id: '2', orderNumber: 'ORD-2024-002', customerId: 'c2', customerName: 'Global Logistics', status: 'processing', totalAmount: 12800, createdAt: '2024-03-11T14:30:00Z', items: [] },
  { id: '3', orderNumber: 'ORD-2024-003', customerId: 'c3', customerName: 'Klos Bakery', status: 'completed', totalAmount: 850, createdAt: '2024-03-12T09:15:00Z', items: [] },
  { id: '4', orderNumber: 'ORD-2024-004', customerId: 'c4', customerName: 'Auto Service Jan', status: 'shipped', totalAmount: 3200, createdAt: '2024-03-13T11:45:00Z', items: [] },
  { id: '5', orderNumber: 'ORD-2024-005', customerId: 'c5', customerName: 'Bud-Max Inc.', status: 'new', totalAmount: 21000, createdAt: '2024-03-14T08:20:00Z', items: [] },
  { id: '6', orderNumber: 'ORD-2024-006', customerId: 'c6', customerName: 'E-Commerce Plus', status: 'processing', totalAmount: 5600, createdAt: '2024-03-14T15:10:00Z', items: [] },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Laptop Dell XPS 15', sku: 'DEL-XPS-15-001', stock: 5, minStock: 10, price: 8500, location: 'Zone A / Rack 1', category: 'Electronics', image: '/dell-latitude.png' },
  { id: '2', name: 'Monitor LG UltraWide 34"', sku: 'LG-UW-34-99', stock: 12, minStock: 5, price: 2400, location: 'Zone B / Rack 4', category: 'Electronics', image: '/lg-ultrawide.png' },
  { id: '3', name: 'Ergohuman Office Chair', sku: 'ERG-CH-02', stock: 8, minStock: 10, price: 1800, location: 'Zone C / Rack 2', category: 'Furniture', image: '/krzeslo-ergohuman.png' },
  { id: '4', name: 'Samsung SSD 1TB', sku: 'SAM-SSD-1TB', stock: 45, minStock: 20, price: 450, location: 'Zone A / Rack 5', category: 'Electronics', image: '/ssd-samsung-1tb.png' },
  { id: '5', name: 'Loft Adjustable Desk', sku: 'LOF-DESK-01', stock: 3, minStock: 5, price: 1200, location: 'Zone C / Rack 1', category: 'Furniture', image: '/biurko-loft.png' },
];

const DEFAULT_VEHICLES: Vehicle[] = [
  { id: '1', make: 'Toyota', model: 'Corolla', registrationNumber: 'WA 12345', type: 'car', mileage: 45000, insuranceExpiry: '2025-05-15', inspectionExpiry: '2025-04-10', lastService: '2023-11-20' },
  { id: '2', make: 'Mercedes', model: 'Sprinter', registrationNumber: 'WB 99887', type: 'van', mileage: 125000, insuranceExpiry: '2025-03-20', inspectionExpiry: '2025-06-01', lastService: '2024-01-10' },
  { id: '3', make: 'Renault', model: 'Master', registrationNumber: 'WE 55443', type: 'van', mileage: 89000, insuranceExpiry: '2025-10-12', inspectionExpiry: '2025-03-15', lastService: '2023-09-05' },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: '1', firstName: 'Mark', lastName: 'Novak', email: 'm.novak@company.com', phone: '+1 600 100 200', position: 'Warehouse Lead', department: 'Logistics', vacationDays: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark' },
  { id: '2', firstName: 'Anna', lastName: 'Green', email: 'a.green@company.com', phone: '+1 600 300 400', position: 'Sales Specialist', department: 'Sales', vacationDays: 20, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' },
  { id: '3', firstName: 'Peter', lastName: 'Wise', email: 'p.wise@company.com', phone: '+1 600 500 600', position: 'Driver', department: 'Transport', vacationDays: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peter' },
  { id: '4', firstName: 'Kate', lastName: 'Wood', email: 'k.wood@company.com', phone: '+1 600 700 800', position: 'Accountant', department: 'Finance', vacationDays: 15, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Tech Solutions LLC', email: 'contact@techsolutions.com', phone: '+1 22 123 4567', address: '1 Main St, New York', totalOrders: 15, lastOrderDate: '2024-03-10' },
  { id: 'c2', name: 'Global Logistics', email: 'office@globallog.com', phone: '+1 12 987 6543', address: '5 Logistics Rd, Chicago', totalOrders: 42, lastOrderDate: '2024-03-11' },
  { id: 'c3', name: 'Klos Bakery', email: 'office@klos.com', phone: '+1 32 555 6677', address: '12 Bread St, Austin', totalOrders: 5, lastOrderDate: '2024-03-12' },
  { id: 'c4', name: 'Auto Service Jan', email: 'jan@autoservice.com', phone: '+1 61 222 3344', address: '3 Garage Ln, Denver', totalOrders: 8, lastOrderDate: '2024-03-13' },
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Prepare quote for Tech Solutions', description: 'Pricing for 10 laptops and monitors.', status: 'todo', priority: 'high', dueDate: '2024-03-20', assignedTo: 'Anna Green' },
  { id: '2', title: 'Schedule Toyota inspection', description: 'Inspection due in 3 days.', status: 'in-progress', priority: 'medium', dueDate: '2024-03-15', assignedTo: 'Mark Novak' },
  { id: '3', title: 'Update warehouse stock', description: 'Verify yesterday delivery.', status: 'done', priority: 'low', dueDate: '2024-03-14', assignedTo: 'Mark Novak' },
  { id: '4', title: 'Send invoices to accounting', description: 'February summary.', status: 'todo', priority: 'medium', dueDate: '2024-03-18', assignedTo: 'Kate Wood' },
];

const DEFAULT_FINANCE: FinanceRecord[] = [
  { id: 'f1', type: 'income', category: 'Sales', amount: 21000, date: '2024-03-14', description: 'Invoice for order #ORD-005', status: 'paid' },
  { id: 'f2', type: 'expense', category: 'Fleet', amount: 350, date: '2024-03-13', description: 'Fuel — Toyota Corolla', status: 'paid' },
  { id: 'f3', type: 'expense', category: 'Purchasing', amount: 4500, date: '2024-03-12', description: 'Stock purchase — Samsung SSD', status: 'pending' },
  { id: 'f4', type: 'expense', category: 'Fixed', amount: 8000, date: '2024-03-11', description: 'Office rent — March', status: 'paid' },
  { id: 'f5', type: 'income', category: 'Sales', amount: 4500, date: '2024-03-10', description: 'Invoice for order #ORD-001', status: 'paid' },
];

const DEFAULT_LEAVE: LeaveRequest[] = [
  {
    id: 'l1',
    employeeId: '1',
    employeeName: 'Mark Novak',
    startDate: '2024-03-20',
    endDate: '2024-03-25',
    type: 'annual',
    status: 'pending',
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'l2',
    employeeId: '2',
    employeeName: 'Anna Green',
    startDate: '2024-04-02',
    endDate: '2024-04-05',
    type: 'other',
    status: 'approved',
    createdAt: '2024-02-15T10:00:00Z',
  },
];

const DEFAULT_DOCS: StoredDocument[] = [
  { id: 'd1', name: 'Invoice_VAT_2024_001.pdf', type: 'pdf', sizeLabel: '124 KB', date: '2024-03-14', category: 'Invoices', dataUrl: '' },
  { id: 'd2', name: 'Office_Lease_Agreement.docx', type: 'doc', sizeLabel: '2.4 MB', date: '2024-03-10', category: 'Contracts', dataUrl: '' },
  { id: 'd3', name: 'Warehouse_ZoneA_Photo.jpg', type: 'image', sizeLabel: '4.1 MB', date: '2024-03-12', category: 'Warehouse', dataUrl: '' },
  { id: 'd4', name: 'Technical_Specification.pdf', type: 'pdf', sizeLabel: '850 KB', date: '2024-03-13', category: 'Technical', dataUrl: '' },
  { id: 'd5', name: 'Sales_Report_February.xlsx', type: 'excel', sizeLabel: '1.2 MB', date: '2024-03-01', category: 'Reports', dataUrl: '' },
];

const DEFAULT_COMPANY: CompanySettings = {
  name: 'Acme Logistics LLC',
  taxId: '525-000-00-00',
  address: '15 Transport Ave, 00-001 Warsaw',
};

function firstLoad<T>(key: string, defaults: T): T {
  const raw = localStorage.getItem(key);
  if (raw == null) {
    write(key, defaults);
    return defaults;
  }
  return read(key, defaults);
}

export function getOrders(): Order[] {
  return firstLoad(K.orders, DEFAULT_ORDERS);
}

export function saveOrders(orders: Order[]): void {
  write(K.orders, orders);
}

export function getProducts(): Product[] {
  return firstLoad(K.products, DEFAULT_PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  write(K.products, products);
}

export function getVehicles(): Vehicle[] {
  return firstLoad(K.vehicles, DEFAULT_VEHICLES);
}

export function saveVehicles(vehicles: Vehicle[]): void {
  write(K.vehicles, vehicles);
}

export function getEmployees(): Employee[] {
  return firstLoad(K.employees, DEFAULT_EMPLOYEES);
}

export function saveEmployees(employees: Employee[]): void {
  write(K.employees, employees);
}

export function getCustomers(): Customer[] {
  return firstLoad(K.customers, DEFAULT_CUSTOMERS);
}

export function saveCustomers(customers: Customer[]): void {
  write(K.customers, customers);
}

export function getTasks(): Task[] {
  return firstLoad(K.tasks, DEFAULT_TASKS);
}

export function saveTasks(tasks: Task[]): void {
  write(K.tasks, tasks);
}

export function getFinanceRecords(): FinanceRecord[] {
  return firstLoad(K.finance, DEFAULT_FINANCE);
}

export function saveFinanceRecords(records: FinanceRecord[]): void {
  write(K.finance, records);
}

export function getLeaveRequests(): LeaveRequest[] {
  return firstLoad(K.leaveRequests, DEFAULT_LEAVE);
}

export function saveLeaveRequests(requests: LeaveRequest[]): void {
  write(K.leaveRequests, requests);
}

export function getDocuments(): StoredDocument[] {
  return firstLoad(K.documents, DEFAULT_DOCS);
}

export function saveDocuments(docs: StoredDocument[]): void {
  write(K.documents, docs);
}

export function getCompanySettings(): CompanySettings {
  return firstLoad(K.company, DEFAULT_COMPANY);
}

export function saveCompanySettings(settings: CompanySettings): void {
  write(K.company, settings);
}

export function getHeaderSearch(): string {
  return read(K.search, '');
}

export function saveHeaderSearch(q: string): void {
  write(K.search, q);
}

export function getMenuLayout(): MenuLayout {
  const v = read<string>(K.menuLayout, 'sidebar');
  return v === 'top' ? 'top' : 'sidebar';
}

export function saveMenuLayout(layout: MenuLayout): void {
  write(K.menuLayout, layout);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
