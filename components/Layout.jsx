import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, FileText, Settings, BookOpen, Database, LogOut, User } from 'lucide-react';
import { authService } from '../services/authService';

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = authService.getStoredAuth();
  
  const navClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex md:flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">UPSC AI</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Intelligent News Scraper</p>
        </div>

        <nav className="mt-2 px-4 space-y-1 flex-1">
          <NavLink to="/" className={navClass}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/scraper" className={navClass}>
            <Newspaper className="w-5 h-5" />
            <span>News Scraper</span>
          </NavLink>
          <NavLink to="/notes" className={navClass}>
            <Database className="w-5 h-5" />
            <span>My Notes (DB)</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-100">
           {user && (
             <div className="mb-4 px-2 flex items-center space-x-2 text-sm text-gray-700">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                 {user.name.charAt(0)}
               </div>
               <div className="truncate">
                 <p className="font-medium">{user.name}</p>
                 <p className="text-xs text-gray-500 truncate">{user.email}</p>
               </div>
             </div>
           )}
           <button 
             onClick={handleLogout}
             className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
           >
             <LogOut className="w-4 h-4" />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-20 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-gray-900">UPSC AI</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500">
             <LogOut className="w-5 h-5" />
          </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
