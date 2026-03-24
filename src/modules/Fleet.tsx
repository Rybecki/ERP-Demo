import React, { useState } from 'react';
import { Truck, Calendar, Shield, Settings, Plus, AlertTriangle, Fuel } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Vehicle } from '../types';
import { generateId, getVehicles, saveVehicles } from '../lib/storage';
import { Modal } from '../components/Modal';

export const FleetModule = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());
  const [addOpen, setAddOpen] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [type, setType] = useState<Vehicle['type']>('car');
  const [mileage, setMileage] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [inspectionExpiry, setInspectionExpiry] = useState('');
  const [lastService, setLastService] = useState('');

  const persist = (next: Vehicle[]) => {
    setVehicles(next);
    saveVehicles(next);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const mi = parseInt(mileage.replace(/\s/g, ''), 10);
    if (!make.trim() || !model.trim() || !registrationNumber.trim() || Number.isNaN(mi)) return;
    const v: Vehicle = {
      id: generateId(),
      make: make.trim(),
      model: model.trim(),
      registrationNumber: registrationNumber.trim(),
      type,
      mileage: mi,
      insuranceExpiry: insuranceExpiry || new Date().toISOString().slice(0, 10),
      inspectionExpiry: inspectionExpiry || new Date().toISOString().slice(0, 10),
      lastService: lastService || new Date().toISOString().slice(0, 10),
    };
    persist([...vehicles, v]);
    setMake('');
    setModel('');
    setRegistrationNumber('');
    setMileage('');
    setInsuranceExpiry('');
    setInspectionExpiry('');
    setLastService('');
    setType('car');
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet</h1>
          <p className="text-muted-foreground">Vehicles, service, and insurance.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Add vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => {
          const isInspectionNear =
            new Date(vehicle.inspectionExpiry).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;
          const isInsuranceNear =
            new Date(vehicle.insuranceExpiry).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

          return (
            <div key={vehicle.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 bg-accent/30 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm font-mono text-primary font-bold mt-1">{vehicle.registrationNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{vehicle.type}</p>
                  </div>
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Truck size={20} />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel size={16} /> Mileage
                  </div>
                  <span className="font-bold">{vehicle.mileage.toLocaleString()} km</span>
                </div>

                <div className="space-y-3">
                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border',
                      isInspectionNear ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 'bg-accent/50 border-border'
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Calendar size={14} /> Technical inspection
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{formatDate(vehicle.inspectionExpiry)}</span>
                      {isInspectionNear && <AlertTriangle size={14} className="animate-pulse" />}
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border',
                      isInsuranceNear ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' : 'bg-accent/50 border-border'
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Shield size={14} /> Insurance
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{formatDate(vehicle.insuranceExpiry)}</span>
                      {isInsuranceNear && <AlertTriangle size={14} className="animate-pulse" />}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                    Repair history
                  </button>
                  <button type="button" className="p-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors" aria-label="Vehicle settings">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add vehicle"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium">
              Cancel
            </button>
            <button type="submit" form="add-vehicle-form" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              Save
            </button>
          </>
        }
      >
        <form id="add-vehicle-form" className="space-y-3" onSubmit={handleAdd}>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Make</label>
              <input required value={make} onChange={(e) => setMake(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Model</label>
              <input required value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Registration</label>
            <input required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as Vehicle['type'])} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20">
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mileage (km)</label>
            <input required type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Insurance until</label>
              <input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Inspection until</label>
              <input type="date" value={inspectionExpiry} onChange={(e) => setInspectionExpiry(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Last service</label>
              <input type="date" value={lastService} onChange={(e) => setLastService(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
