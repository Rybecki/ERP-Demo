export type UserRole = 'admin' | 'manager' | 'employee' | 'accounting';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  assignedEmployeeId?: string;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  location?: string;
  category: string;
  image?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  type: 'car' | 'van' | 'truck';
  mileage: number;
  insuranceExpiry: string;
  inspectionExpiry: string;
  lastService: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  vacationDays: number;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  lastOrderDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  status?: 'paid' | 'pending';
}

export type LeaveType = 'annual' | 'unpaid' | 'sick' | 'other';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface StoredDocument {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  date: string;
  category: string;
  dataUrl: string;
}

export interface CompanySettings {
  name: string;
  taxId: string;
  address: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  read: boolean;
}
