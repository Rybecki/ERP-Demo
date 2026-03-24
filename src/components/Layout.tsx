import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  FileText,
  UserCircle,
  CheckSquare,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  PanelLeft,
  PanelTop,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  getHeaderSearch,
  saveHeaderSearch,
  getLeaveRequests,
  getMenuLayout,
  saveMenuLayout,
  type MenuLayout,
} from '../lib/storage';
import { Modal } from './Modal';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

const TopNavItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
      active
        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    )}
  >
    <Icon size={18} className={cn('shrink-0', active && 'text-primary-foreground')} />
    <span className="hidden xl:inline">{label}</span>
  </button>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: SidebarItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex items-center w-full p-3 my-1 rounded-xl transition-all duration-200 group relative text-left',
      active
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
    )}
  >
    <Icon
      size={20}
      className={cn('shrink-0', active ? 'text-white' : 'group-hover:scale-110 transition-transform')}
    />
    {!collapsed && <span className="ml-3 font-medium truncate">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
        {label}
      </div>
    )}
  </button>
);

export type ActiveModule =
  | 'dashboard'
  | 'orders'
  | 'warehouse'
  | 'fleet'
  | 'hr'
  | 'docs'
  | 'crm'
  | 'tasks'
  | 'finance'
  | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}

export const Layout = ({ children, activeModule, setActiveModule }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => getHeaderSearch());
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState<MenuLayout>(() => getMenuLayout());
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, logout } = useAuth();

  const isTopNav = menuLayout === 'top';

  const toggleMenuLayout = () => {
    const next: MenuLayout = menuLayout === 'sidebar' ? 'top' : 'sidebar';
    setMenuLayout(next);
    saveMenuLayout(next);
  };

  useEffect(() => {
    saveHeaderSearch(searchQuery);
  }, [searchQuery]);

  const pendingLeave = getLeaveRequests().filter((r) => r.status === 'pending').length;

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
    { id: 'warehouse' as const, label: 'Warehouse', icon: Package },
    { id: 'fleet' as const, label: 'Fleet', icon: Truck },
    { id: 'hr' as const, label: 'Employees', icon: Users },
    { id: 'docs' as const, label: 'Documents', icon: FileText },
    { id: 'crm' as const, label: 'Customers', icon: UserCircle },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    { id: 'finance' as const, label: 'Finance', icon: Wallet },
  ];

  const handleModuleChange = (id: ActiveModule) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <aside
        className={cn(
          'flex-col border-r border-border bg-card transition-all duration-300 ease-in-out z-30',
          isTopNav ? 'hidden' : 'hidden md:flex',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">N</div>
              <span>NexusERP</span>
            </motion.div>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold mx-auto">
              N
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  active={activeModule === item.id}
                  onClick={() => handleModuleChange(item.id)}
                  collapsed={sidebarCollapsed}
                />
              </React.Fragment>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <SidebarItem
              icon={Settings}
              label="Settings"
              active={activeModule === 'settings'}
              onClick={() => handleModuleChange('settings')}
              collapsed={sidebarCollapsed}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 md:hidden flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xl text-primary">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">N</div>
                <span>NexusERP</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-accent"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-4 overflow-y-auto">
              {menuItems.map((item) => (
                <React.Fragment key={item.id}>
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    active={activeModule === item.id}
                    onClick={() => handleModuleChange(item.id)}
                  />
                </React.Fragment>
              ))}
              <div className="mt-4 pt-4 border-t border-border">
                <SidebarItem
                  icon={Settings}
                  label="Settings"
                  active={activeModule === 'settings'}
                  onClick={() => handleModuleChange('settings')}
                />
              </div>
              <div className="mt-4 pt-4 border-t border-border px-2 pb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Desktop layout</p>
                <button
                  type="button"
                  onClick={() => {
                    toggleMenuLayout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-accent/50 hover:bg-accent border border-border"
                >
                  {isTopNav ? <PanelLeft size={18} /> : <PanelTop size={18} />}
                  {isTopNav ? 'Use side menu' : 'Use top menu'}
                </button>
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className={cn(
            'border-b border-border bg-card/50 backdrop-blur-md z-20 shrink-0',
            isTopNav ? 'flex flex-col md:flex' : 'flex h-16 items-center'
          )}
        >
          {isTopNav && (
            <div className="hidden md:flex items-center h-14 px-4 lg:px-8 gap-3 border-b border-border/70 w-full bg-card/80">
              <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">N</div>
                <span className="hidden lg:inline">NexusERP</span>
              </div>
              <nav className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scrollbar-hide py-1" aria-label="Main">
                {menuItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <TopNavItem
                      icon={item.icon}
                      label={item.label}
                      active={activeModule === item.id}
                      onClick={() => handleModuleChange(item.id)}
                    />
                  </React.Fragment>
                ))}
                <TopNavItem
                  icon={Settings}
                  label="Settings"
                  active={activeModule === 'settings'}
                  onClick={() => handleModuleChange('settings')}
                />
              </nav>
            </div>
          )}

          <div
            className={cn(
              'flex items-center justify-between px-4 md:px-8 w-full min-h-0',
              isTopNav ? 'h-14 py-2 md:h-14' : 'h-16'
            )}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-accent shrink-0"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              {isTopNav && (
                <div className="hidden md:flex items-center gap-2 font-bold text-primary shrink-0 mr-2 lg:hidden">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm">N</div>
                </div>
              )}
              <div className="hidden sm:flex items-center bg-accent/50 rounded-full px-4 py-1.5 w-64 md:w-96 border border-border focus-within:ring-2 ring-primary/20 transition-all min-w-0">
                <Search size={18} className="text-muted-foreground mr-2 shrink-0" />
                <input
                  type="search"
                  placeholder="Search orders, customers…"
                  className="bg-transparent border-none outline-none text-sm w-full min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Global search"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
            <button
              type="button"
              onClick={toggleMenuLayout}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors hidden sm:flex"
              title={isTopNav ? 'Use side menu' : 'Use top menu'}
              aria-label={isTopNav ? 'Switch to side navigation' : 'Switch to top navigation'}
            >
              {isTopNav ? <PanelLeft size={20} /> : <PanelTop size={20} />}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
              aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setBellOpen(!bellOpen)}
                className="p-2 rounded-full hover:bg-accent text-muted-foreground relative transition-colors"
                aria-label="Notifications"
                aria-expanded={bellOpen}
              >
                <Bell size={20} />
                {pendingLeave > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full border-2 border-card px-1">
                    {pendingLeave > 9 ? '9+' : pendingLeave}
                  </span>
                )}
              </button>
              {bellOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close notifications"
                    onClick={() => setBellOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-3 text-sm">
                    <p className="font-bold mb-2">Notifications</p>
                    <p className="text-muted-foreground text-xs">
                      {pendingLeave > 0
                        ? `${pendingLeave} pending leave request(s). Open Employees to review.`
                        : 'No pending leave requests.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{tenant?.name}</span>
              </div>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setProfileOpen(true)}
                  className="rounded-full border-2 border-primary/20 p-0.5 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 ring-primary/30"
                  aria-label="Open profile"
                >
                  <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center w-full p-2 text-sm rounded-lg hover:bg-accent text-left"
                  >
                    <UserCircle size={16} className="mr-2" /> Profile
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center w-full p-2 text-sm rounded-lg hover:bg-accent text-destructive text-left"
                  >
                    <LogOut size={16} className="mr-2" /> Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Profile">
        <p className="text-sm text-muted-foreground">
          Demo: profile settings would open here. Your session is stored in memory only; data you add elsewhere is
          saved in <code className="text-xs bg-accent px-1 rounded">localStorage</code>.
        </p>
      </Modal>
    </div>
  );
};
