import React, { useState, useEffect } from 'react';

const Sensors = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState([]);

  // Default data perfectly matching your Capstone UI design
  const mockNodes = [
    {
      id: 1, name: "Node 01 — Eggplant Zone", location: "Stall 1 • GPIO 4 • ESP32 DevKit V1",
      status: "Online", statusColor: "bg-emerald-50 text-emerald-700", dot: "text-emerald-500",
      temp: "33.4°C", tempSub: "Temperature", tempColor: "text-blue-500 bg-blue-50/50",
      rh: "82%", rhSub: "Humidity RH", rhColor: "text-emerald-600 bg-emerald-50/50",
      msgBox: "bg-amber-50 border-amber-100 text-amber-800", msgText: "Temp 3.4°C above eggplant stress threshold (30°C). CHU accelerating.",
      vpd: "1.42 kPa", vpdColor: "text-rose-500",
      battery: "87% charged", batColor: "text-[#2A6B48]",
      solar: "Charging", solarColor: "text-slate-800",
      syncTime: "Synced 2 min ago", syncColor: "text-slate-400", cardBorder: "border-slate-200"
    },
    {
      id: 2, name: "Node 02 — Cucumber Zone", location: "Stall 1 • GPIO 4 • ESP32 DevKit V1",
      status: "Online", statusColor: "bg-emerald-50 text-emerald-700", dot: "text-emerald-500",
      temp: "29.8°C", tempSub: "Temperature", tempColor: "text-blue-500 bg-blue-50/50",
      rh: "78%", rhSub: "Humidity RH", rhColor: "text-emerald-600 bg-emerald-50/50",
      msgBox: "bg-emerald-50 border-emerald-100 text-emerald-800", msgText: "Within acceptable range. Cucumber batch monitoring stable.",
      vpd: "0.88 kPa", vpdColor: "text-[#2A6B48]",
      battery: "92% charged", batColor: "text-[#2A6B48]",
      solar: "Charging", solarColor: "text-slate-800",
      syncTime: "Synced 1 min ago", syncColor: "text-slate-400", cardBorder: "border-slate-200"
    },
    {
      id: 3, name: "Node 03 — Carrots Zone", location: "Stall 77 • GPIO 4 • ESP32 DevKit V1",
      status: "Delay", statusColor: "bg-amber-100 text-amber-700", dot: "text-amber-500",
      temp: "31.2°C", tempSub: "Last reading", tempColor: "text-slate-400 bg-slate-50 border border-slate-100",
      rh: "74%", rhSub: "Last reading", rhColor: "text-slate-400 bg-slate-50 border border-slate-100",
      msgBox: "bg-amber-50 border-amber-100 text-amber-800", msgText: "Connectivity delay — local buffer active. Data will auto-sync on reconnect.",
      vpd: "23 logs pending", vpdTitle: "Buffer status", vpdColor: "text-amber-600",
      battery: "61% charged", batColor: "text-amber-600",
      solar: "Partial shade", solarColor: "text-slate-800",
      syncTime: "Last sync 9 min ago", syncColor: "text-amber-500", cardBorder: "border-2 border-amber-200"
    }
  ];

  useEffect(() => {
    // READY FOR IOT: This function attempts to fetch live data from your Django backend.
    const fetchLiveSensorData = async () => {
      try {
        // Attempt to reach your Django API
        const response = await fetch('http://127.0.0.1:8000/api/nodes/');
        if (response.ok) {
          const data = await response.json();
          // If your DB actually has ESP32 data, map it here.
          // For now, we simulate a fast loading state and load the mock UI
          if (data.length > 0) {
            // Mapping logic would go here
          }
        }
      } catch (error) {
        console.log("No live DB detected, falling back to UI presentation data.");
      } finally {
        setTimeout(() => {
          setNodes(mockNodes);
          setIsLoading(false);
        }, 600); // Slight artificial delay to show the connecting animation
      }
    };

    fetchLiveSensorData();
    // Set an interval here later if you want it to ping the ESP32 every 5 seconds!
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-pulse">
        <span className="text-4xl block mb-4">📡</span>
        <h2 className="text-xl font-bold text-slate-600">Connecting to IoT Nodes...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sensor Nodes</h1>
          <p className="text-slate-500 text-sm mt-1">DHT22 nodes • ESP32 microcontrollers • Bulua WBIT Stall 1</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors">
            Sync All
          </button>
          <button className="px-5 py-2.5 bg-[#2A6B48] text-white rounded-lg text-sm font-bold hover:bg-[#1f5035] shadow-sm transition-colors">
            Add Node
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Nodes</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">3</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">MQTT connected</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Temperature</p>
          <h2 className="text-4xl font-bold text-amber-500">33.4°</h2>
          <p className="text-sm text-rose-500 mt-2 font-medium">3.4° above threshold</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg Humidity</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">82%</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Within safe range</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between bg-amber-50/30">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Node With Delay</p>
          <h2 className="text-4xl font-bold text-amber-500">1</h2>
          <p className="text-sm text-amber-600 mt-2 font-medium">Buffer active - Node 03</p>
        </div>
      </div>

      {/* Node Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <div key={node.id} className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col relative overflow-hidden ${node.cardBorder}`}>
            
            {/* Ambient Background for Delay Card */}
            {node.status === "Delay" && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 opacity-50"></div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{node.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{node.location}</p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${node.statusColor}`}>
                <span className={`text-[10px] ${node.dot}`}>●</span> {node.status}
              </span>
            </div>

            <div className="flex gap-4 mb-4">
              <div className={`rounded-xl p-4 flex-1 ${node.tempColor}`}>
                <h4 className="text-3xl font-bold text-slate-800">{node.temp}</h4>
                <p className="text-xs font-medium mt-1">{node.tempSub}</p>
              </div>
              <div className={`rounded-xl p-4 flex-1 ${node.rhColor}`}>
                <h4 className="text-3xl font-bold text-slate-800">{node.rh}</h4>
                <p className="text-xs font-medium mt-1">{node.rhSub}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border mb-5 ${node.msgBox}`}>
              <p className="text-sm font-medium leading-relaxed">{node.msgText}</p>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{node.vpdTitle || "VPD calculated"}</span>
                <span className={`font-bold ${node.vpdColor}`}>{node.vpd}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Battery backup</span>
                <span className={`font-bold ${node.batColor}`}>{node.battery}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Solar panel</span>
                <span className={`font-bold ${node.solarColor}`}>{node.solar}</span>
              </div>
            </div>

            <div className={`mt-6 pt-4 border-t border-slate-100 text-xs font-medium flex justify-between items-center ${node.syncColor}`}>
              <span>{node.syncTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Temperature Trend Chart (CSS Mockup exactly matching your UI design) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Temperature Trend — Last 6 Hours</h2>
        <p className="text-xs text-slate-500 mb-6">All 3 nodes • Stress threshold line at 30°C</p>
        
        {/* Pseudo Chart Container */}
        <div className="relative h-64 w-full flex items-end justify-between pb-6 pl-8">
          
          {/* Y-Axis Labels & Grid Lines */}
          <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pb-6 text-[10px] text-slate-400 font-medium z-0">
            <div className="flex items-center w-full"><span className="w-6">38°</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
            <div className="flex items-center w-full"><span className="w-6">34°</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
            <div className="flex items-center w-full relative"><span className="w-6">30°</span><div className="flex-1 border-b-2 border-rose-200 border-dashed ml-2"></div></div>
            <div className="flex items-center w-full"><span className="w-6">26°</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
            <div className="flex items-center w-full"><span className="w-6">22°</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
          </div>

          {/* Chart Bars */}
          <div className="relative z-10 w-full flex justify-around items-end h-[calc(100%-1.5rem)] ml-2">
            <div className="w-[14%] bg-emerald-100 h-[35%] rounded-t-sm hover:opacity-80 transition-opacity"></div>
            <div className="w-[14%] bg-emerald-200 h-[38%] rounded-t-sm hover:opacity-80 transition-opacity"></div>
            <div className="w-[14%] bg-amber-100 h-[45%] rounded-t-sm hover:opacity-80 transition-opacity"></div>
            <div className="w-[14%] bg-amber-200 h-[65%] rounded-t-sm hover:opacity-80 transition-opacity"></div>
            <div className="w-[14%] bg-amber-400 h-[80%] rounded-t-sm hover:opacity-80 transition-opacity"></div>
            <div className="w-[14%] bg-rose-400 h-[95%] rounded-t-sm hover:opacity-80 transition-opacity shadow-[0_0_15px_rgba(251,113,133,0.3)]"></div>
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-0 left-8 w-[calc(100%-2rem)] flex justify-around text-[10px] text-slate-400 font-medium">
            <span className="w-[14%] text-center">3:00</span>
            <span className="w-[14%] text-center">4:00</span>
            <span className="w-[14%] text-center">5:00</span>
            <span className="w-[14%] text-center">7:00</span>
            <span className="w-[14%] text-center">8:00</span>
            <span className="w-[14%] text-center">9:41</span>
          </div>
        </div>

        {/* Warning Banner Below Chart */}
        <div className="mt-4 bg-rose-50 rounded-lg p-3 border border-rose-100 text-sm font-medium text-rose-700 flex items-center">
          <span className="mr-2">⚠️</span> Threshold exceeded at 9:00 AM - Node 01 (Eggplant) - 33.4°C
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2A6B48]"></span> Node 01 (Eggplant)</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Node 02 (Cucumber)</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Node 03 (Carrots)</div>
          <div className="flex items-center gap-1.5 ml-auto"><span className="w-4 h-0.5 bg-rose-400"></span> Stress threshold (30°C)</div>
        </div>
      </div>

      {/* Threshold Configuration Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Crop Threshold Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Based on PAES 417:2002 - Philippine Agricultural Engineering Standard</p>
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            Edit Thresholds
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Crop</th>
                <th className="p-4">Optimal Temp</th>
                <th className="p-4">Optimal RH</th>
                <th className="p-4">Stress Trigger</th>
                <th className="p-4">Min RH Trigger</th>
                <th className="p-4 pr-6">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 align-middle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl border border-slate-100">🍆</div>
                  <div>
                    <p className="font-bold text-slate-800">Eggplant</p>
                    <p className="text-xs text-slate-400 italic">Solanum melongena</p>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-700">10 – 12°C</td>
                <td className="p-4 font-semibold text-slate-700">90 – 95%</td>
                <td className="p-4 font-bold text-rose-500">{'>'}25°C sustained</td>
                <td className="p-4 font-semibold text-slate-700">{'<'}90% RH</td>
                <td className="p-4 pr-6">
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5 w-max">
                    <span className="text-[10px] text-amber-500">●</span> Stress Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 align-middle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl border border-slate-100">🥒</div>
                  <div>
                    <p className="font-bold text-slate-800">Cucumber</p>
                    <p className="text-xs text-slate-400 italic">Cucumis sativus</p>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-700">10 – 12.5°C</td>
                <td className="p-4 font-semibold text-slate-700">95%</td>
                <td className="p-4 font-semibold text-slate-700">{'>'}25°C sustained</td>
                <td className="p-4 font-semibold text-slate-700">{'<'}85% RH</td>
                <td className="p-4 pr-6">
                  <span className="px-3 py-1.5 bg-slate-50 text-amber-700 border border-slate-200 text-xs font-bold rounded-full flex items-center gap-1.5 w-max">
                    <span className="text-[10px] text-amber-500">●</span> Monitoring
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 align-middle flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-xl border border-slate-100">🥕</div>
                  <div>
                    <p className="font-bold text-slate-800">Carrots</p>
                    <p className="text-xs text-slate-400 italic">Daucus carota</p>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-700">0 – 2°C</td>
                <td className="p-4 font-semibold text-slate-700">95 – 100%</td>
                <td className="p-4 font-semibold text-slate-700">{'>'}30°C sustained</td>
                <td className="p-4 font-semibold text-slate-700">{'<'}95% RH</td>
                <td className="p-4 pr-6">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-full flex items-center gap-1.5 w-max">
                    <span className="text-[10px] text-emerald-500">●</span> Normal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Sensors;