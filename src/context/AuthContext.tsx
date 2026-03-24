import React, { createContext, useContext, useState } from 'react';
import { User, Tenant } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'u1',
  name: 'John Smith',
  email: 'john@company.com',
  role: 'admin',
  tenantId: 't1',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

const MOCK_TENANT: Tenant = {
  id: 't1',
  name: 'Acme Logistics LLC',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [tenant, setTenant] = useState<Tenant | null>(MOCK_TENANT);

  const login = (_email: string) => {
    setUser(MOCK_USER);
    setTenant(MOCK_TENANT);
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
