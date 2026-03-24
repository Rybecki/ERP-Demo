import React, { useState } from 'react';
import { Plus, MoreHorizontal, Calendar, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task } from '../types';
import { generateId, getTasks, saveTasks } from '../lib/storage';
import { motion } from 'motion/react';
import { Modal } from '../components/Modal';

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-500',
  medium: 'bg-amber-500/10 text-amber-500',
  high: 'bg-rose-500/10 text-rose-500',
};

const statusCycle: Task['status'][] = ['todo', 'in-progress', 'done'];

function nextStatus(s: Task['status']): Task['status'] {
  const i = statusCycle.indexOf(s);
  return statusCycle[(i + 1) % statusCycle.length];
}

const Column = ({
  title,
  tasks,
  onAddClick,
  onTaskClick,
}: {
  title: string;
  tasks: Task[];
  onAddClick: () => void;
  onTaskClick: (task: Task) => void;
}) => (
  <div className="flex flex-col h-full min-w-[300px] bg-accent/5 rounded-2xl border border-border/50 p-4">
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
        <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <button type="button" onClick={onAddClick} className="p-1 hover:bg-accent rounded-lg transition-colors" aria-label="Add task in column">
        <Plus size={16} className="text-muted-foreground" />
      </button>
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
      {tasks.map((task) => (
        <motion.div
          layout
          key={task.id}
          role="button"
          tabIndex={0}
          onClick={() => onTaskClick(task)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTaskClick(task);
            }
          }}
          className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group text-left w-full"
        >
          <div className="flex items-start justify-between mb-2">
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', priorityColors[task.priority])}>
              {task.priority}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="More"
            >
              <MoreHorizontal size={14} className="text-muted-foreground" />
            </button>
          </div>
          <h4 className="font-bold text-sm mb-1">{task.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{task.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
              <Calendar size={12} /> {task.dueDate}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary">
              <User size={12} /> {task.assignedTo.split(' ')[0]}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Click card to move to next column</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export const TasksModule = () => {
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  const [addOpen, setAddOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('todo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const persist = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const cycleTask = (task: Task) => {
    persist(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus(t.status) } : t)));
  };

  const openAdd = (status: Task['status']) => {
    setDefaultStatus(status);
    setAddOpen(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate.trim() || !assignedTo.trim()) return;
    const t: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || '—',
      status: defaultStatus,
      priority,
      dueDate,
      assignedTo: assignedTo.trim(),
    };
    persist([...tasks, t]);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setAssignedTo('');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Kanban board — click a card to advance its status.</p>
        </div>
        <button
          type="button"
          onClick={() => openAdd('todo')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New task
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        <Column title="To do" tasks={tasks.filter((t) => t.status === 'todo')} onAddClick={() => openAdd('todo')} onTaskClick={cycleTask} />
        <Column title="In progress" tasks={tasks.filter((t) => t.status === 'in-progress')} onAddClick={() => openAdd('in-progress')} onTaskClick={cycleTask} />
        <Column title="Done" tasks={tasks.filter((t) => t.status === 'done')} onAddClick={() => openAdd('done')} onTaskClick={cycleTask} />
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="New task"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-task-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-task-form" className="space-y-3" onSubmit={handleAdd}>
          <p className="text-xs text-muted-foreground">Initial column: {defaultStatus}</p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Due date</label>
              <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Assigned to</label>
            <input required value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Full name" className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
        </form>
      </Modal>
    </div>
  );
};
