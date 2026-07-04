import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/batches', label: 'Harvest Batches', icon: '📦' },
    { path: '/sensors', label: 'Sensor Nodes', icon: '📟' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <span className="text-2xl">🌱</span>
        <h1 className="text-xl font-bold tracking-wide text-emerald-400">AgriResQ</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                isActive
                  ? 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Area */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Admin Terminal</p>
            <p className="text-xs text-slate-500">Bulua Westbound</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-3 flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <span className="text-lg">🔓</span>
          <span className="text-sm">Log out</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;