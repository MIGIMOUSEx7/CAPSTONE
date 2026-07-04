import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {

        const response = await fetch('http://127.0.0.1:8000/api/batches/');
        const liveBatches = await response.json();
        setBatches(liveBatches);



        setTimeout(() => {
          setBatches([
            { id: "#001", crop: "Eggplant", qty: "85 kg", days: "2 days", status: "At-Risk", statusColor: "bg-rose-100 text-rose-700" },
            { id: "#002", crop: "Cucumber", qty: "60 kg", days: "4 days", status: "Monitoring", statusColor: "bg-amber-100 text-amber-700" },
            { id: "#003", crop: "Carrots", qty: "120 kg", days: "8 days", status: "Fresh", statusColor: "bg-emerald-100 text-emerald-700" },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-pulse">
        <h2 className="text-xl font-bold text-slate-600 mt-4">Loading Dashboard...</h2>
      </div>
    );
  }

  // Dynamically calculate metrics
  const atRiskCount = batches.filter(b => b.status === 'At-Risk').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Bulua Westbound Terminal • Stall 1</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Batches</p>
            <h2 className="text-3xl font-bold text-slate-800">{batches.length}</h2>
          </div>
          <p className="text-sm text-emerald-600 mt-4 font-medium">↑ Synced with API</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">At-Risk Items</p>
            <h2 className="text-3xl font-bold text-rose-500">{atRiskCount}</h2>
          </div>
          <p className="text-sm text-rose-600 mt-4">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Temp Now</p>
            <h2 className="text-3xl font-bold text-amber-500">33.4°</h2>
          </div>
          <p className="text-sm text-amber-600 mt-4">↑ 3.4° above threshold</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Humidity</p>
            <h2 className="text-3xl font-bold text-emerald-600">82%</h2>
          </div>
          <p className="text-sm text-slate-500 mt-4">Within safe range</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Active harvest batches</h2>
          <button className="text-emerald-600 text-sm font-semibold hover:underline">View all →</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Crop</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Days Left</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-800">
                    {batch.crop} <span className="block text-xs text-slate-400 font-normal">Batch {batch.id}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{batch.qty}</td>
                  <td className="p-4 font-bold text-slate-800">{batch.days}</td>
                  <td className="p-4 pr-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${batch.statusColor}`}>
                      ● {batch.status}
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

export default Dashboard;