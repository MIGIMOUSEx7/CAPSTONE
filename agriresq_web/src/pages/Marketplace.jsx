import React, { useState, useEffect } from 'react';

const Marketplace = () => {
  // 1. STATE SETUP: These will hold the live data from your backend
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. LIVE DATA FETCHING: This runs automatically when the page loads
  useEffect(() => {
    // This is the function that will talk to your Django API
    const fetchMarketplaceData = async () => {
      try {
  
        const listingsResponse = await fetch('http://127.0.0.1:8000/api/listings/');
        const liveListings = await listingsResponse.json();
        setListings(liveListings);

        const txResponse = await fetch('http://127.0.0.1:8000/api/transactions/');
        const liveTransactions = await txResponse.json();
        setTransactions(liveTransactions);



        setTimeout(() => {
          setListings([
            { id: 1, crop: 'Eggplant', icon: '🍆', batch: 'Batch #001', vendor: 'Stall 1 • Marhean B.', status: 'At-Risk', statusBg: 'bg-amber-100 text-amber-700', qty: '85 kg', days: '2 days', temp: '33.4°C', rh: '82%', priceType: 'Rescue Price', price: '₱18 / kg', inquiries: '3 buyers interested', isAtRisk: true },
            { id: 2, crop: 'Eggplant', icon: '🍆', batch: 'Batch #004', vendor: 'Stall 1 • Marhean B.', status: 'At-Risk', statusBg: 'bg-amber-100 text-amber-700', qty: '40 kg', days: '1.5 days', temp: '34.1°C', rh: '60%', priceType: 'Rescue Price', price: '₱16 / kg', inquiries: '1 buyer interested', isAtRisk: true },
            { id: 3, crop: 'Cucumber', icon: '🥒', batch: 'Batch #002', vendor: 'Stall 1 • Marhean B.', status: 'Fresh', statusBg: 'bg-emerald-100 text-emerald-700', qty: '60 kg', days: '4 days', temp: '29.8°C', rh: '78%', priceType: 'Standard Price', price: '₱22 / kg', inquiries: '2 buyers interested', isAtRisk: false },
            { id: 4, crop: 'Carrots', icon: '🥕', batch: 'Batch #003', vendor: 'Stall 1 • Marhean B.', status: 'Fresh', statusBg: 'bg-emerald-100 text-emerald-700', qty: '120 kg', days: '8 days', temp: '24.5°C', rh: '91%', priceType: 'Standard Price', price: '₱15 / kg', inquiries: '5 buyers interested', isAtRisk: false },
            { id: 5, crop: 'Cucumber', icon: '🥒', batch: 'Batch #005', vendor: 'Stall 77 • Dominic G.', status: 'Fresh', statusBg: 'bg-emerald-100 text-emerald-700', qty: '75 kg', days: '5 days', temp: '27.3°C', rh: '85%', priceType: 'Standard Price', price: '₱21 / kg', inquiries: '0 buyers yet', isAtRisk: false },
          ]);

          setTransactions([
            { id: '#TXN-041', buyerName: 'Maria Buenaflor', buyerRole: 'Restaurant owner', crop: '🍆 Eggplant', batch: 'Batch #001', qty: '20 kg', total: '₱360', type: 'Rescue', typeBg: 'bg-amber-100 text-amber-700', typeDot: 'text-amber-500', status: 'Confirmed', statusBg: 'bg-blue-50 text-blue-700', statusDot: 'text-blue-500', time: '9:43 AM' },
            { id: '#TXN-040', buyerName: 'Jose Reyes', buyerRole: 'Sari-sari store', crop: '🥕 Carrots', batch: 'Batch #003', qty: '15 kg', total: '₱225', type: 'Standard', typeBg: 'bg-emerald-100 text-emerald-700', typeDot: 'text-emerald-500', status: 'Confirmed', statusBg: 'bg-blue-50 text-blue-700', statusDot: 'text-blue-500', time: '8:30 AM' },
            { id: '#TXN-039', buyerName: 'Ana Perez', buyerRole: 'Food processor', crop: '🥒 Cucumber', batch: 'Batch #002', qty: '25 kg', total: '₱475', type: 'Standard', typeBg: 'bg-emerald-100 text-emerald-700', typeDot: 'text-emerald-500', status: 'Pending pickup', statusBg: 'bg-slate-100 text-slate-700', statusDot: 'text-slate-400', time: '7:15 AM' },
          ]);
          
          setIsLoading(false);
        }, 500); // 500ms artificial delay to show loading state

      } catch (error) {
        console.error("Error fetching live marketplace data:", error);
        setIsLoading(false);
      }
    };

    fetchMarketplaceData();
    
    // Optional: Refresh data every 30 seconds for a truly "live" feel
    // const interval = setInterval(fetchMarketplaceData, 30000);
    // return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 animate-pulse">
        <span className="text-4xl block mb-4">🛒</span>
        <h2 className="text-xl font-bold text-slate-600">Connecting to Marketplace...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Rescue Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Freshness-verified surplus listings - Bulua WBIT - Live Data</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors">
            Filter
          </button>
          <button className="px-5 py-2.5 bg-[#2A6B48] text-white rounded-lg text-sm font-bold hover:bg-[#1f5035] shadow-sm transition-colors">
            New Listing
          </button>
        </div>
      </div>

      {/* Flash Deals Banner */}
      <div className="bg-[#2A6B48] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center text-white shadow-md">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            🔥 2 Flash Rescue Deals Active
          </h2>
          <p className="text-sm text-emerald-100/90 max-w-lg">
            Eggplant Batch #001 and #004 are At-Risk — listed for immediate rescue buyers. Act within 1.5–2 days.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">2</span>
            <span className="text-xs text-emerald-100">At-Risk listed</span>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">₱1,060</span>
            <span className="text-xs text-emerald-100">Total rescue value</span>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">8</span>
            <span className="text-xs text-emerald-100">Rescued today</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Listings</p>
          <h2 className="text-4xl font-bold text-emerald-600 mb-1">{listings.length}</h2>
          <p className="text-xs text-slate-500 font-medium">Active in marketplace</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">At-Risk Listings</p>
          <h2 className="text-4xl font-bold text-amber-500 mb-1">{listings.filter(l => l.isAtRisk).length}</h2>
          <p className="text-xs text-amber-500 font-medium">Flash rescue deals</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Orders Today</p>
          <h2 className="text-4xl font-bold text-blue-600 mb-1">{transactions.length}</h2>
          <p className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-700">₱1,820</span> rescued value</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Buyers</p>
          <h2 className="text-4xl font-bold text-slate-800 mb-1">12</h2>
          <p className="text-xs text-slate-500 font-medium">4 active now</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search listings..." className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 text-sm shadow-sm focus:outline-none focus:border-emerald-500" />
        <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700 shadow-sm outline-none"><option>All Crops</option></select>
        <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700 shadow-sm outline-none"><option>All Status</option></select>
        <select className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700 shadow-sm outline-none"><option>Sort: Urgency</option></select>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div key={item.id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm flex flex-col ${item.isAtRisk ? 'border-amber-200' : 'border-slate-100'}`}>
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl border border-slate-100 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.crop}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.batch} · {item.vendor}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${item.statusBg}`}>
                <span className="text-[10px]">●</span> {item.status}
              </span>
            </div>

            {/* Card Body Grid */}
            <div className="grid grid-cols-2 gap-y-4 mb-5 text-sm">
              <div>
                <p className="text-slate-500 mb-1 text-xs">Quantity</p>
                <p className="font-bold text-slate-800">{item.qty} available</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 mb-1 text-xs">Days-to-Spoil</p>
                <p className="font-bold text-slate-800">{item.days}</p>
              </div>
              
              <div className="col-span-2 border-t border-slate-100 my-1"></div>

              <div>
                <p className="text-slate-500 mb-1 text-xs">Temp / RH</p>
                <p className="font-bold text-slate-800">{item.temp} • {item.rh}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 mb-1 text-xs">{item.priceType}</p>
                <p className="font-bold text-[#2A6B48] text-lg leading-none">{item.price}</p>
              </div>

              <div>
                <p className="text-slate-500 text-xs">Inquiries</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600 text-xs">{item.inquiries}</p>
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-auto flex gap-3">
              <button className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-colors bg-[#2A6B48] hover:bg-[#1f5035]`}>
                {item.crop === 'Cucumber' && item.batch === 'Batch #005' ? 'Promote' : 'View Buyers'}
              </button>
              <button className="flex-1 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Edit Listing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recent Rescue Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Confirmed buyer orders today</p>
          </div>
          <button className="text-[#2A6B48] text-sm font-bold hover:underline">View all</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-5 pl-6 font-semibold">Order ID</th>
                <th className="p-5 font-semibold">Buyer</th>
                <th className="p-5 font-semibold">Crop / Batch</th>
                <th className="p-5 font-semibold">Qty</th>
                <th className="p-5 font-semibold">Total</th>
                <th className="p-5 font-semibold">Type</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 pr-6 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 pl-6 font-bold text-slate-800">{tx.id}</td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{tx.buyerName}</p>
                    <p className="text-xs text-slate-500">{tx.buyerRole}</p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{tx.crop}</p>
                    <p className="text-xs text-slate-500">{tx.batch}</p>
                  </td>
                  <td className="p-5 font-semibold text-slate-700">
                    <span className="block w-8">{tx.qty.split(' ')[0]} <br/><span className="text-xs text-slate-400 font-normal">{tx.qty.split(' ')[1]}</span></span>
                  </td>
                  <td className="p-5 font-bold text-[#2A6B48]">{tx.total}</td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border border-white flex items-center gap-1.5 w-max ${tx.typeBg}`}>
                      <span className={`text-[10px] ${tx.typeDot}`}>●</span> {tx.type}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 w-max ${tx.statusBg}`}>
                      <span className={`text-[10px] ${tx.statusDot}`}>●</span> {tx.status}
                    </span>
                  </td>
                  <td className="p-5 pr-6 font-bold text-slate-800">
                    <span className="block w-12">{tx.time.split(' ')[0]} <br/><span className="text-xs text-slate-500">{tx.time.split(' ')[1]}</span></span>
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

export default Marketplace;