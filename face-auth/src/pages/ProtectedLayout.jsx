import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedLayout = ({ children, account }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown/sidebar on click outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container')) {
        setShowDropdown(false);
      }
      if (showSidebar && !e.target.closest('.sidebar-container') && !e.target.closest('.menu-trigger')) {
        setShowSidebar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar]);

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
      )
    },
    { 
      name: 'Live Doubt Resolution', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
      )
    },
    { 
      name: 'Guided Problem Solving', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      )
    },
    { 
      name: 'Intelligent Video Learning', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="2" y="3" rx="2"/><path d="m22 7-3.5 2"/><path d="m22 11-3.5-2"/><path d="m9 6 3 3-3 3"/></svg>
      )
    },
    { 
      name: 'Smart Revision', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
      )
    }
  ];

  return (
    <div className="w-full relative min-h-screen">
      {/* Menu Trigger - Top Left */}
      <div 
        className="fixed top-16 left-16 z-[60] cursor-pointer menu-trigger p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:scale-110 transition-all duration-300"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <div className="flex flex-col gap-1.5 w-8">
          <div className={`h-1 bg-gray-900 rounded-full transition-all ${showSidebar ? 'rotate-45 translate-y-2.5' : ''}`}></div>
          <div className={`h-1 bg-gray-900 rounded-full transition-all ${showSidebar ? 'opacity-0' : ''}`}></div>
          <div className={`h-1 bg-gray-900 rounded-full transition-all ${showSidebar ? '-rotate-45 -translate-y-2.5' : ''}`}></div>
        </div>
      </div>

      {/* Sidebar - Slide out */}
      <div className={`fixed inset-y-0 left-0 w-96 z-50 transform transition-transform duration-500 ease-in-out sidebar-container ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full bg-white/10 backdrop-blur-2xl border-r border-white/20 p-8 pt-40 shadow-2xl flex flex-col gap-6">
          <h2 className="text-gray-900 text-2xl font-bold mb-4 px-4">Menu</h2>
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => {
                if (item.name === 'Guided Problem Solving') {
                  navigate('/guided-problem-solving');
                } else if (item.name === 'Live Doubt Resolution') {
                  navigate('/live-doubt-resolution');
                } else if (item.name === 'Dashboard') {
                  navigate('/protected');
                }
                setShowSidebar(false);
              }}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-125 transition-transform text-gray-700">{item.icon}</span>
              <span className="text-gray-900 font-bold text-lg">{item.name}</span>
            </div>
          ))}
          
          <div className="mt-auto pt-8 border-t border-white/10">
             <div 
              onClick={() => {
                localStorage.removeItem("faceAuth");
                navigate("/");
              }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 transition-all duration-300 cursor-pointer text-red-600 font-bold"
            >
              <span className="text-2xl">🚪</span>
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image - Positioned Top Right */}
      <div className="fixed top-16 right-16 z-50 profile-container">
        <div 
          className="relative cursor-pointer group"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <img
            className={`object-cover h-24 w-24 rounded-full border-4 border-white shadow-2xl transition-all duration-300 ${showDropdown ? 'scale-110 ring-4 ring-black/10' : 'hover:scale-110'}`}
            src={
              account?.type === "CUSTOM"
                ? account.picture
                : `/temp-accounts/${account.picture}`
            }
            alt={account.fullName || 'User'}
          />
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full"></div>

          {/* Logout Dropdown */}
          {showDropdown && (
            <div className="absolute top-[120%] right-0 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{account.fullName}</p>
                <p className="text-xs text-gray-500 truncate">Logged in via Face</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("faceAuth");
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-bold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProtectedLayout;
