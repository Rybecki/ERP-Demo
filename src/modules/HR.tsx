import React, { useMemo, useState } from 'react';
import { Users, Plus, Phone, Mail, Calendar, UserPlus, Search } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Employee, LeaveRequest, LeaveType } from '../types';
import { generateId, getEmployees, saveEmployees, getLeaveRequests, saveLeaveRequests } from '../lib/storage';
import { Modal } from '../components/Modal';

const leaveTypeLabel: Record<LeaveType, string> = {
  annual: 'Annual leave',
  unpaid: 'Unpaid',
  sick: 'Sick leave',
  other: 'Other',
};

export const HRModule = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [requests, setRequests] = useState<LeaveRequest[]>(() => getLeaveRequests());
  const [searchTerm, setSearchTerm] = useState('');
  const [empOpen, setEmpOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [vacationDays, setVacationDays] = useState('20');

  const [leaveEmployeeId, setLeaveEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [leaveNotes, setLeaveNotes] = useState('');

  const persistEmp = (next: Employee[]) => {
    setEmployees(next);
    saveEmployees(next);
  };

  const persistLeave = (next: LeaveRequest[]) => {
    setRequests(next);
    saveLeaveRequests(next);
  };

  const filteredEmployees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, searchTerm]);

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const vd = parseInt(vacationDays, 10);
    if (!fn.trim() || !ln.trim() || !email.trim() || Number.isNaN(vd)) return;
    const emp: Employee = {
      id: generateId(),
      firstName: fn.trim(),
      lastName: ln.trim(),
      email: email.trim(),
      phone: phone.trim() || '—',
      position: position.trim() || 'Employee',
      department: department.trim() || 'General',
      vacationDays: vd,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fn + ln)}`,
    };
    persistEmp([...employees, emp]);
    setFn('');
    setLn('');
    setEmail('');
    setPhone('');
    setPosition('');
    setDepartment('');
    setVacationDays('20');
    setEmpOpen(false);
  };

  const addLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveEmployeeId || !startDate || !endDate) return;
    const emp = employees.find((x) => x.id === leaveEmployeeId);
    if (!emp) return;
    const req: LeaveRequest = {
      id: generateId(),
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      startDate,
      endDate,
      type: leaveType,
      status: 'pending',
      notes: leaveNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    persistLeave([req, ...requests]);
    setStartDate('');
    setEndDate('');
    setLeaveNotes('');
    setLeaveOpen(false);
  };

  const setStatus = (id: string, status: LeaveRequest['status']) => {
    persistLeave(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const deleteRequest = (id: string) => {
    if (!confirm('Remove this leave request?')) return;
    persistLeave(requests.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees (HR)</h1>
          <p className="text-muted-foreground">Team, leave, and HR records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLeaveOpen(true)}
            className="bg-accent text-accent-foreground px-4 py-3 rounded-xl font-bold hover:bg-accent/80 transition-all flex items-center gap-2"
          >
            <Calendar size={20} /> New leave request
          </button>
          <button
            type="button"
            onClick={() => setEmpOpen(true)}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <UserPlus size={20} /> Add employee
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search employees…"
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-primary/10" />
            <div className="flex flex-col items-center text-center">
              <img
                src={employee.avatar}
                alt=""
                className="w-20 h-20 rounded-full border-4 border-background shadow-sm mb-4"
              />
              <h3 className="font-bold text-lg">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">{employee.position}</p>
              <p className="text-xs text-muted-foreground mt-2">{employee.department}</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary shrink-0" />
                <span>{employee.phone}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">PTO left</p>
                <p className="text-sm font-bold">{employee.vacationDays} days</p>
              </div>
              <button type="button" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Details <Calendar size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Users size={20} className="text-primary" /> Leave requests
          </h3>
          <p className="text-xs text-muted-foreground">{requests.length} total · {requests.filter((r) => r.status === 'pending').length} pending</p>
        </div>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-accent/30 rounded-xl border border-border gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold shrink-0">
                    {request.employeeName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{request.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {leaveTypeLabel[request.type]} · {formatDate(request.startDate)} – {formatDate(request.endDate)}
                    </p>
                    {request.notes && <p className="text-xs mt-1 text-muted-foreground">{request.notes}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      request.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : request.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                    )}
                  >
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(request.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(request.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => setStatus(request.id, 'pending')}
                      className="px-3 py-1.5 bg-background border border-border text-xs font-bold rounded-lg hover:bg-accent"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteRequest(request.id)}
                    className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-rose-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        open={empOpen}
        onClose={() => setEmpOpen(false)}
        title="Add employee"
        footer={
          <>
            <button type="button" onClick={() => setEmpOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-emp-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-emp-form" className="space-y-3" onSubmit={addEmployee}>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">First name</label>
              <input required value={fn} onChange={(e) => setFn(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Last name</label>
              <input required value={ln} onChange={(e) => setLn(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Position</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">PTO days (balance)</label>
            <input required type="number" min={0} value={vacationDays} onChange={(e) => setVacationDays(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
        </form>
      </Modal>

      <Modal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="New leave request"
        footer={
          <>
            <button type="button" onClick={() => setLeaveOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="leave-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Submit
            </button>
          </>
        }
      >
        <form id="leave-form" className="space-y-3" onSubmit={addLeaveRequest}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Employee</label>
            <select
              required
              value={leaveEmployeeId}
              onChange={(e) => setLeaveEmployeeId(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20"
            >
              <option value="">Select…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Start</label>
              <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">End</label>
              <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20">
              {(Object.keys(leaveTypeLabel) as LeaveType[]).map((k) => (
                <option key={k} value={k}>
                  {leaveTypeLabel[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Notes (optional)</label>
            <textarea value={leaveNotes} onChange={(e) => setLeaveNotes(e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20 resize-none" />
          </div>
        </form>
      </Modal>
    </div>
  );
};
