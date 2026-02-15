import React, { useState } from 'react';
import { LayoutDashboard, Droplets, Sprout, Shield, TrendingUp, HelpCircle, FileText } from 'lucide-react';

export default function KrishibodhSidebar() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Droplets, label: 'Water & Irrigation' },
    { icon: Sprout, label: 'Crop Recommendation' },
    { icon: Shield, label: 'Yield & Pest' },
    { icon: TrendingUp, label: 'Market Prices' },
    { icon: HelpCircle, label: 'Assistance' },
    { icon: FileText, label: 'Reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className="w-72 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #1e2730 0%, #252e38 50%, #1e2730 100%)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Logo Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.3)'
              }}
            >
              <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg tracking-tight">Krishibodh</h1>
              <p className="text-slate-400 text-xs font-medium">Decision Support</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            
            return (
              <button
                key={item.label}
                onClick={() => setActiveItem(item.label)}
                className="w-full group relative"
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-300 ease-out
                    ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                  `}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)',
                          boxShadow: '0 8px 24px rgba(45, 106, 79, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        }
                      : {
                          background: 'transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{
                        background: 'linear-gradient(180deg, #95d5b2 0%, #d8f3dc 100%)',
                        boxShadow: '0 0 12px rgba(149, 213, 178, 0.6)'
                      }}
                    />
                  )}

                  <Icon 
                    className={`
                      w-5 h-5 transition-all duration-300
                      ${isActive 
                        ? 'text-white drop-shadow-lg' 
                        : 'text-slate-400 group-hover:text-slate-200'
                      }
                    `}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  <span 
                    className={`
                      text-sm font-medium transition-all duration-300
                      ${isActive 
                        ? 'text-white font-semibold' 
                        : 'text-slate-400 group-hover:text-slate-200'
                      }
                    `}
                  >
                    {item.label}
                  </span>

                  {/* Subtle shine effect on active */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="px-4 py-4 border-t border-white/10">
          <div 
            className="px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <p className="text-slate-400 text-xs font-medium">Powered by AI</p>
            <p className="text-slate-200 text-sm font-semibold mt-0.5">Smart Agriculture</p>
          </div>
        </div>
      </div>

      {/* Main Content Area (White) - For Context */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600 mb-6">Welcome to Krishibodh Decision Support System</p>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Metric {i}</h3>
                <p className="text-sm text-gray-500">Sample dashboard content</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
