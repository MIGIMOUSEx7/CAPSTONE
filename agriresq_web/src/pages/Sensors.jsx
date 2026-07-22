import React, { useState, useEffect } from 'react';

const Sensors = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [liveNode, setLiveNode] = useState(null);

  useEffect(() => {
    // Initial static state to keep the UI looking good while loading
    setLiveNode({
      id: 1, 
      name: "AgriResQ Sensor Node — Active", 
      location: "Stall 1 • GPIO 4 • ESP32 DevKit V1",
      status: "Online", 
      statusColor: "bg-emerald-50 text-emerald-700", 
      dot: "text-emerald-500",
      temp: "--°C", 
      tempSub: "Temperature", 
      tempColor: "text-blue-500 bg-blue-50/50",
      rh: "--%", 
      rhSub: "Humidity RH", 
      rhColor: "text-emerald-600 bg-emerald-50/50",
      msgBox: "bg-amber-50 border-amber-100 text-amber-800", 
      msgText: "Initializing live sensor stream from EMQX Cloud...",
      vpd: "Calculating...", 
      vpdColor: "text-rose-500",
      battery: "87% charged", 
      batColor: "text-[#2A6B48]",
      solar: "Charging", 
      solarColor: "text-slate-800",
      syncTime: "Connecting...", 
      syncColor: "text-slate-400", 
      cardBorder: "border-emerald-500"
    });
    setIsLoading(false);

    // LIVE POLLING: Fetches the latest log from your Django database
    const pollBackend = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No auth token found in localStorage — user may not be logged in.');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/logs/', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (response.ok) {
          const logs = await response.json();
          // SensorLog.Meta.ordering = ['-timestamp'], so Django already
          // returns these newest-first. The most recent entry is logs[0],
          // NOT logs[logs.length - 1] (that would be the oldest of the 50
          // returned rows).
          const latest = logs[0];

          if (latest) {
            setLiveNode(prev => ({
              ...prev,
              temp: `${latest.temperature_c}°C`,
              rh: `${latest.humidity_rh}%`,
              msgText: latest.temperature_c > 30
                ? "Warning: Temp above stress threshold. CHU accelerating."
                : "System operational. Conditions within range.",
              syncTime: `Last sync: ${new Date(latest.timestamp).toLocaleTimeString()}`
            }));
          }
        } else if (response.status === 401) {
          console.warn('Logs request unauthorized — token missing/invalid/expired.');
        } else {
          console.error('Unexpected response from /api/logs/:', response.status);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollBackend();
    const interval = setInterval(pollBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="p-10 animate-pulse text-slate-400">Syncing node data...</div>;
  if (!liveNode) return <div className="p-10 text-rose-500">Node data unavailable.</div>;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sensor Nodes</h1>
          <p className="text-slate-500 text-sm mt-1">DHT22 node • ESP32 microcontroller • Bulua WBIT Stall 1</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Nodes</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">1</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Temperature</p>
          <h2 className="text-4xl font-bold text-amber-500">{liveNode.temp}</h2>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Humidity</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">{liveNode.rh}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col relative overflow-hidden ${liveNode.cardBorder}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{liveNode.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{liveNode.location}</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${liveNode.statusColor}`}>● {liveNode.status}</span>
          </div>
          <div className="flex gap-4 mb-4">
            <div className={`rounded-xl p-4 flex-1 ${liveNode.tempColor}`}>
              <h4 className="text-3xl font-bold text-slate-800">{liveNode.temp}</h4>
              <p className="text-xs font-medium mt-1">{liveNode.tempSub}</p>
            </div>
            <div className={`rounded-xl p-4 flex-1 ${liveNode.rhColor}`}>
              <h4 className="text-3xl font-bold text-slate-800">{liveNode.rh}</h4>
              <p className="text-xs font-medium mt-1">{liveNode.rhSub}</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl border mb-5 ${liveNode.msgBox}`}>
            <p className="text-sm font-medium leading-relaxed">{liveNode.msgText}</p>
          </div>
          <div className="space-y-3 mt-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">VPD calculated</span>
              <span className={`font-bold ${liveNode.vpdColor}`}>{liveNode.vpd}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Battery backup</span>
              <span className={`font-bold ${liveNode.batColor}`}>{liveNode.battery}</span>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t border-slate-100 text-xs font-medium ${liveNode.syncColor}`}>{liveNode.syncTime}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Temperature Trend — Last 6 Hours</h2>
        <div className="relative h-64 w-full flex items-end justify-between pb-6 pl-8">
            <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pb-6 text-[10px] text-slate-400 font-medium">
                <div>38°</div><div>34°</div><div className="text-rose-400">30°</div><div>26°</div><div>22°</div>
            </div>
            <div className="w-[14%] bg-emerald-100 h-[35%] rounded-t-sm"></div>
            <div className="w-[14%] bg-emerald-200 h-[38%] rounded-t-sm"></div>
            <div className="w-[14%] bg-amber-100 h-[45%] rounded-t-sm"></div>
            <div className="w-[14%] bg-amber-200 h-[65%] rounded-t-sm"></div>
            <div className="w-[14%] bg-amber-400 h-[80%] rounded-t-sm"></div>
            <div className="w-[14%] bg-rose-400 h-[95%] rounded-t-sm"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr><th className="p-4">Crop</th><th className="p-4">Optimal</th><th className="p-4">Stress</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            <tr><td className="p-4 font-bold">Eggplant</td><td className="p-4">10-12°C</td><td className="p-4">{'>'}25°C</td><td className="p-4 text-amber-500 font-bold">● Stress Active</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sensors;