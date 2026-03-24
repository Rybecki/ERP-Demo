import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { getCompanySettings, saveCompanySettings } from '../lib/storage';

export const SettingsModule = () => {
  const { theme, toggleTheme } = useTheme();
  const [company, setCompany] = useState(() => getCompanySettings());
  const [savedFlash, setSavedFlash] = useState(false);

  const persistCompany = () => {
    saveCompanySettings(company);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">System options, appearance, and company profile (saved locally).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'General', icon: SettingsIcon, active: true },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'integrations', label: 'Integrations', icon: Globe },
            { id: 'database', label: 'Database', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                item.active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-accent text-muted-foreground'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Company</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Company name</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Tax ID</label>
                <input
                  type="text"
                  value={company.taxId}
                  onChange={(e) => setCompany((c) => ({ ...c, taxId: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Head office address</label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-end gap-3">
              {savedFlash && <span className="text-xs text-emerald-500 font-medium">Saved to localStorage</span>}
              <button
                type="button"
                onClick={persistCompany}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Palette size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dark mode</p>
                    <p className="text-xs text-muted-foreground">Toggle light and dark theme.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cn('w-12 h-6 rounded-full transition-all relative', theme === 'dark' ? 'bg-primary' : 'bg-muted')}
                  aria-pressed={theme === 'dark'}
                >
                  <div
                    className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                      theme === 'dark' ? 'right-1' : 'left-1'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Automation (demo toggles)</h3>
            <div className="space-y-4">
              {[
                { id: 1, label: 'Auto-assign employee to new orders', enabled: true },
                { id: 2, label: 'Low stock email alerts', enabled: true },
                { id: 3, label: 'Fleet inspection reminders (14 days)', enabled: true },
                { id: 4, label: 'Generate PDF when order completes', enabled: false },
              ].map((auto) => (
                <div key={auto.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border">
                  <span className="text-sm font-medium">{auto.label}</span>
                  <button
                    type="button"
                    className={cn('w-12 h-6 rounded-full transition-all relative', auto.enabled ? 'bg-primary' : 'bg-muted')}
                    aria-label={auto.label}
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                        auto.enabled ? 'right-1' : 'left-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
