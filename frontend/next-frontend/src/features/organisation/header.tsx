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
  
  return (
    <header className="sticky top-0 z-50 h-16 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.h1
            className="text-xl font-semibold text-slate-900"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/`}>Taskify</Link>
          </motion.h1>

          {/* Navigation Menu */}
          <NavigationDropdown />
        </div>


        <div className="flex items-center space-x-4">

          <div className="relative cursor-pointer text-sx">
            <Search size={15} className="text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search tasks, sprints, or projects..."
              className="pl-8 bg-transparent border shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 h-8 w-full"
            />
          </div>

          {/* Settings Icon */}
          <div className=" hover:bg-gray-100 rounded-md cursor-pointer">
            <Settings size={15} className="text-[#42526E]" />
          </div>

          {/* Notification Icon */}
          <div className=" hover:bg-gray-100 rounded-md cursor-pointer">
            <Bell size={15} className="text-[#42526E]" />
          </div>
          {currentUser && <UserAccountDropdown user={currentUser} />}
        </div>
      </div>
    </header>
  );
};