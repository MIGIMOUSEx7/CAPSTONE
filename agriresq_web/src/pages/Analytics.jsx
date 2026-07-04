import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // READY FOR BACKEND: 
    // This would typically fetch from a Django endpoint like /api/analytics/summary/
    // where you aggregate total transactions, average sensor logs, and ML accuracy.
    const fetchAnalytics = async () => {
      try {
        // const response = await fetch('http://127.0.0.1:8000/api/analytics/summary/');
        // const liveData = await response.json();
        // setData(liveData);
        throw new Error("Simulating API fetch fallback to UI design data");
      } catch (error) {
        // Fallback to exactly match your Capstone design UI
        setTimeout(() => {
          setData({
            totalRescued: "842",
            revenue: "₱14,280",
            wasteReduction: "73%",
            accuracy: "91%",
            accuracyTable: [
              { id: 1, crop: "Eggplant", scientific: "Solanum melongena", icon: "🍆", tested: 14, correct: 13, acc: "92.8%", result: "Pass", color: "text-emerald-600" },
              { id: 2, crop: "Cucumber", scientific: "Cucumis sativus", icon: "🥒", tested: 11, correct: 10, acc: "90.9%", result: "Pass", color: "text-emerald-600" },
              { id: 3, crop: "Carrots", scientific: "Daucus carota", icon: "🥕", tested: 9, correct: 8, acc: "88.9%", result: "Review", color: "text-amber-500" }
            ]
          });
          setIsLoading(false);
        }, 500);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-pulse">
        <h2 className="text-xl font-bold text-slate-600 mt-4">Generating Analytics Report...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Post-harvest performance - Bulua Westbound Terminal - April 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm">
            April 2026
          </button>
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors">
            Export PDF
          </button>
          <button className="px-5 py-2.5 bg-[#2A6B48] text-white rounded-lg text-sm font-bold hover:bg-[#1f5035] shadow-sm transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total KG Rescued</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">{data.totalRescued} <span className="text-xl">kg</span></h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">+16% vs last month</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rescue Revenue</p>
          <h2 className="text-4xl font-bold text-slate-800">{data.revenue}</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Saved from waste</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Waste Reduction</p>
          <h2 className="text-4xl font-bold text-[#2A6B48]">{data.wasteReduction}</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">vs pre-AgriResQ baseline</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Algorithm Accuracy</p>
          <h2 className="text-4xl font-bold text-blue-600">{data.accuracy}</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Alerts within 24-48h window</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Rescued by Crop */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">kg Rescued by Crop — April 2026</h3>
          <p className="text-xs text-slate-500 mb-6">Total produce rescued per crop type this month</p>
          
          <div className="relative h-48 w-full flex items-end justify-center gap-12 pb-6">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pb-6 text-[10px] text-slate-400 font-medium z-0">
              <div className="flex items-center w-full"><span className="w-6">450</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">300</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">150</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">0</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
            </div>

            {/* Bars */}
            <div className="relative z-10 w-24 h-[85%] bg-purple-100 border-2 border-purple-200 rounded-t-md flex flex-col justify-end items-center pb-2"></div>
            <div className="relative z-10 w-24 h-[50%] bg-emerald-50 border-2 border-emerald-200 rounded-t-md flex flex-col justify-end items-center pb-2"></div>
            <div className="relative z-10 w-24 h-[35%] bg-orange-50 border-2 border-orange-200 rounded-t-md flex flex-col justify-end items-center pb-2"></div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 w-full flex justify-center gap-12 text-[10px] font-bold text-slate-600">
              <div className="w-24 text-center">🍆 Eggplant <br/><span className="text-slate-800">384kg</span></div>
              <div className="w-24 text-center">🥒 Cucumber <br/><span className="text-slate-800">225kg</span></div>
              <div className="w-24 text-center">🥕 Carrots <br/><span className="text-slate-800">160kg</span></div>
            </div>
          </div>
        </div>

        {/* Chart 2: Daily Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Daily Rescue Transactions — Apr 18-24</h3>
          <p className="text-xs text-slate-500 mb-6">Number of rescue orders completed per day</p>
          
          <div className="relative h-48 w-full flex items-end justify-between pb-6 pl-8">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full w-full flex flex-col justify-between pb-6 text-[10px] text-slate-400 font-medium z-0">
              <div className="flex items-center w-full"><span className="w-6">12</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">9</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">6</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">3</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
              <div className="flex items-center w-full"><span className="w-6">0</span><div className="flex-1 border-b border-slate-100 ml-2"></div></div>
            </div>

            {/* Bars */}
            <div className="relative z-10 w-[10%] h-[40%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[65%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[30%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[75%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[100%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[65%] bg-emerald-50 border border-emerald-200 rounded-t-sm"></div>
            <div className="relative z-10 w-[10%] h-[65%] bg-[#2A6B48] rounded-t-sm shadow-md"></div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-8 w-[calc(100%-2rem)] flex justify-between text-[10px] text-slate-400 font-medium pr-2">
              <span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span className="font-bold text-slate-800">24 •</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table: Prediction Accuracy */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Algorithm Prediction Accuracy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Days-to-Spoil vs actual spoilage - physiological validation</p>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left h-full">
              <thead>
                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 pl-6">Crop</th>
                  <th className="p-4 text-center">Batches Tested</th>
                  <th className="p-4 text-center">Correct Alerts<br/>(24-48H)</th>
                  <th className="p-4">Accuracy</th>
                  <th className="p-4 pr-6">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.accuracyTable.map((row) => (
                  <tr key={row.id}>
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg">{row.icon}</div>
                      <span className="font-bold text-slate-800">{row.crop}</span>
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600">{row.tested}</td>
                    <td className="p-4 text-center font-medium text-slate-600">{row.correct}</td>
                    <td className={`p-4 font-bold ${row.color}`}>{row.acc}</td>
                    <td className="p-4 pr-6">
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${row.color}`}>
                        <span className="text-[10px]">●</span> {row.result}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/30">
                  <td className="p-4 pl-6 font-bold text-slate-800">Overall System</td>
                  <td colSpan="2" className="p-4 text-center font-medium text-slate-600 text-xs">
                    31 / 34 correct
                  </td>
                  <td className="p-4 font-bold text-emerald-600">91.2%</td>
                  <td className="p-4 pr-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <span className="text-[10px]">●</span> Pass
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Waste Reduction Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">% waste prevented this month</p>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-bold">
                <span className="text-slate-800 flex items-center gap-2">🍆 Eggplant</span>
                <span className="text-slate-600">78%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#2A6B48] h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-bold">
                <span className="text-slate-800 flex items-center gap-2">🥒 Cucumber</span>
                <span className="text-slate-600">71%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#2A6B48] h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1.5 font-bold">
                <span className="text-slate-800 flex items-center gap-2">🥕 Carrots</span>
                <span className="text-amber-500">62%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-2">
              <div className="flex justify-between text-sm mb-1.5 font-bold">
                <span className="text-slate-800">Overall</span>
                <span className="text-emerald-600">73%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-1">Downloadable Reports</h3>
        <p className="text-xs text-slate-500 mb-6">Generated from IoT logs, sensor data, and marketplace transactions</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="border border-slate-100 rounded-xl p-5 hover:border-emerald-200 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Monthly Spoilage Report</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Summary of all batch spoilage events, Days-to-Spoil accuracy, and CHU multiplier performance.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Generated: Apr 24, 2026</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-5 hover:border-blue-200 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-blue-50 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Sensor Log Export</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Raw DHT22 time-series data — temperature & humidity readings from all 3 nodes, CSV format.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-emerald-500">Updated live</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-5 hover:border-amber-200 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-amber-50 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Rescue Transaction Report</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">All confirmed rescue orders, buyer info, kg rescued, total revenue, and pickup times.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Generated: Apr 24, 2026</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-5 hover:border-rose-200 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-rose-50 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Algorithm Accuracy Audit</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Physiological validation results comparing system At-Risk alerts vs actual spoilage timeline.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Generated: Apr 24, 2026</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-5 hover:border-emerald-200 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Waste Reduction Summary</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Comparison of organic waste before and after AgriResQ deployment at Bulua WBIT.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Generated: Apr 24, 2026</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-5 hover:border-slate-300 transition-colors group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-slate-100 mb-3"></div>
            <h4 className="font-bold text-slate-800 text-sm mb-2">Buyer Activity Report</h4>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Rescue buyer engagement — inquiries, purchases, average order size, and repeat buyer rate.</p>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">Generated: Apr 24, 2026</span>
              <span className="text-[#2A6B48] group-hover:underline">Download</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Analytics;