// components/Header.tsx
'use client'
import Link from 'next/link';
import React from 'react';
import { useAuth } from '@/src/Authentication/authcontext';
import { motion } from "framer-motion";
import { Bell, Search, Settings } from 'lucide-react';
import UserAccountDropdown from './accountDropdown';
import NavigationDropdown from './NavigationDropdown';
import { Input } from '@/components/ui/input';


export const Header: React.FC = () => {

  const { currentUser } = useAuth()
  console.log("Current user in header: ", currentUser);
  
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border shadow-sm overflow-visible">
      {/* Background Layer: Separated to prevent backdrop-filter from creating a containing block for fixed modals */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm -z-10 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 md:space-x-6 lg:space-x-8 min-w-0">
          <motion.h1
            className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/`}>Taskify</Link>
          </motion.h1>

          {/* Navigation Menu - Hidden on mobile, shown from tablet up */}
          <div className="hidden md:block">
            <NavigationDropdown />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {/* Search Bar - hidden on mobile, width scales on larger screens */}
          <div className="hidden sm:flex relative cursor-pointer md:w-64 lg:w-80 xl:w-96">
            <Search size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search..."
              className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-0 placeholder:text-slate-400 h-9 w-full rounded-md transition-all"
            />
          </div>

          {/* Quick Actions - Icons hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-1 md:space-x-2">
            <div className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors group">
              <Settings size={16} className="text-slate-500 group-hover:text-slate-700 dark:text-slate-400" />
            </div>
            <div className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors group relative">
              <Bell size={16} className="text-slate-500 group-hover:text-slate-700 dark:text-slate-400" />
            </div>
          </div>

          {/* Mobile Search Icon - visible only on smallest screens */}
          <div className="sm:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer">
            <Search size={18} className="text-slate-500 dark:text-slate-400" />
          </div>

          {currentUser && <UserAccountDropdown user={currentUser} />}
        </div>
      </div>
    </header>
  );
};