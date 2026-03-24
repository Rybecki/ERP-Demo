import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Layout, ActiveModule } from './components/Layout';
import { Dashboard } from './modules/Dashboard';
import { OrdersModule } from './modules/Orders';
import { WarehouseModule } from './modules/Warehouse';
import { FleetModule } from './modules/Fleet';
import { HRModule } from './modules/HR';
import { CRMModule } from './modules/CRM';
import { TasksModule } from './modules/Tasks';
import { FinanceModule } from './modules/Finance';
import { DocumentsModule } from './modules/Documents';
import { SettingsModule } from './modules/Settings';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'orders': return <OrdersModule />;
      case 'warehouse': return <WarehouseModule />;
      case 'fleet': return <FleetModule />;
      case 'hr': return <HRModule />;
      case 'crm': return <CRMModule />;
      case 'tasks': return <TasksModule />;
      case 'finance': return <FinanceModule />;
      case 'docs': return <DocumentsModule />;
      case 'settings': return <SettingsModule />;
      default: return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout activeModule={activeModule} setActiveModule={setActiveModule}>
          {renderModule()}
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
