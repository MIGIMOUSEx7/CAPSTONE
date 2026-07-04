import React, { useState, useEffect } from 'react';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {

        const response = await fetch('http://127.0.0.1:8000/api/batches/');
        const liveBatches = await response.json();
        setBatches(liveBatches);


        // Simulating API delay and data fetch
        setTimeout(() => {
          setBatches([
            { id: '#001', node: 'Stall 1 • Node 01', icon: '🍆', crop: 'Eggplant', scientific: 'Solanum melongena', qty: '85 kg', price: '₱18/kg', arrival: 'Apr 24, 6:00 AM', days: 2, daysColor: 'text-amber-500', temp: '33.4°C', rh: '82% RH', status: 'At-Risk', statusBg: 'bg-amber-100 text-amber-700' },
            { id: '#002', node: 'Stall 1 • Node 02', icon: '🥒', crop: 'Cucumber', scientific: 'Cucumis sativus', qty: '60 kg', price: '₱22/kg', arrival: 'Apr 24, 8:00 AM', days: 4, daysColor: 'text-amber-500', temp: '29.8°C', rh: '78% RH', status: 'Monitoring', statusBg: 'bg-amber-100 text-amber-700' },
            { id: '#003', node: 'Stall 1 • Node 03', icon: '🥕', crop: 'Carrots', scientific: 'Daucus carota', qty: '120 kg', price: '₱15/kg', arrival: 'Apr 24, 5:30 AM', days: 8, daysColor: 'text-emerald-600', temp: '24.5°C', rh: '91% RH', status: 'Fresh', statusBg: 'bg-emerald-100 text-emerald-700' },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch batches:", error);
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-pulse">
        <h2 className="text-xl font-bold text-slate-600 mt-4">Syncing with IoT Sensors...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Batches</h1>
          <p className="text-slate-500 text-sm mt-1">Bulua Westbound Terminal • Stall 1</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Filter</button>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Export</button>
          <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors">+ New Batch</button>
        </div>
      </div>

      {/* Top Stats - Now dynamically calculated from State! */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Batches</p>
          <h2 className="text-3xl font-bold text-emerald-800">{batches.length}</h2>
          <p className="text-sm text-slate-500 mt-1">Active in inventory</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">At-Risk Batches</p>
          <h2 className="text-3xl font-bold text-amber-500">
            {batches.filter(b => b.status === 'At-Risk').length}
          </h2>
          <p className="text-sm text-amber-600 mt-1">Needs immediate listing</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fresh Batches</p>
          <h2 className="text-3xl font-bold text-emerald-600">
            {batches.filter(b => b.status === 'Fresh' || b.status === 'Monitoring').length}
          </h2>
          <p className="text-sm text-emerald-600 mt-1">Within safe threshold</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Spoiled / Removed</p>
          <h2 className="text-3xl font-bold text-rose-500">0</h2>
          <p className="text-sm text-rose-500 mt-1">Removed from stock today</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <input type="text" placeholder="Search batch name, crop type..." className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
        <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 shadow-sm"><option>All Crops</option></select>
        <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 shadow-sm"><option>All Status</option></select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">Active Harvest Batches</h2>
            <p className="text-slate-500 text-xs mt-0.5">All registered surplus produce • updated live via IoT</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                <th className="p-4 pl-6">Batch ID</th>
                <th className="p-4">Crop</th>
                <th className="p-4">Qty (KG)</th>
                <th className="p-4">Arrival</th>
                <th className="p-4">Days-to-Spoil</th>
                <th className="p-4">Temp / RH</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {batches.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 align-top pt-5">
                    <p className="font-bold text-slate-800">{row.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{row.node}</p>
                  </td>
                  <td className="p-4 align-top pt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">{row.icon}</div>
                    <div>
                      <p className="font-bold text-slate-800">{row.crop}</p>
                      <p className="text-xs text-slate-400 italic">{row.scientific}</p>
                    </div>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <p className="font-bold text-slate-800">{row.qty}</p>
                    <p className="text-xs text-slate-500">{row.price}</p>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <p className="font-bold text-slate-800">{row.arrival.split(',')[0]}</p>
                    <p className="text-xs text-slate-500">{row.arrival.split(',')[1]}</p>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <p className={`font-bold ${row.daysColor}`}>{row.days} days</p>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${row.daysColor.replace('text', 'bg')}`} style={{width: `${(row.days/8)*100}%`}}></div>
                    </div>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <p className="font-bold text-slate-800">{row.temp}</p>
                    <p className="text-xs text-slate-500">{row.rh}</p>
                  </td>
                  <td className="p-4 align-top pt-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${row.statusBg}`}>
                      <span className="mr-1.5">●</span>{row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Batches;