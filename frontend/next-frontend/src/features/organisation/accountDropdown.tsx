import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User2, Moon, Sun, LogOut, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/src/helpers/type';
import Button from '@/src/components/ui/button';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/Authentication/authcontext';
import UserSettingsPage from './userSettings';

interface UserAccountDropdownProps {
  user: User
}

const UserAccountDropdown = ({ user }: UserAccountDropdownProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { Logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await Logout();
    router.push('/user/signup');
  };

  // Motion animation for menu items
  const itemAnimation = {
    whileHover: { x: 2 },
    transition: { duration: 0.2 }
  };

  return (
    <DropdownMenu>
      {/* Dropdown Trigger */}
      <DropdownMenuTrigger asChild>
        <button className="relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-full transition-transform active:scale-95">
          <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-slate-200/50 group-hover:ring-indigo-300 group-hover:ring-offset-2 transition-all duration-200">
            <AvatarImage src={user.image.imageFullUrl} alt={`${user.image.imageUserName}`} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 text-sm font-semibold">
              {user.firstname[0]}{user.lastname[0]}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Profile Section */}
        <div className="p-4 pb-2">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image.imageFullUrl} alt={`${user.image.imageUserName}`} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg">
                {user.firstname[0]}{user.lastname[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="font-medium text-sm">{user.firstname} {user.lastname}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Account Management Section */}
        <DropdownMenuGroup className="p-2">
          <motion.div {...itemAnimation}>
            <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2" onClick={() => <UserSettingsPage /> }>
                <User2 size={16} className="text-gray-500" />
                <span>Manage My Account</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Upgrade Section */}
        <div className="p-3">
          <div className="bg-indigo-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-indigo-800 mb-1">Upgrade Your Account</h4>
            <p className="text-xs text-indigo-600 mb-2">Get premium features and unlimited access</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1"
              >
                Upgrade Now
              </Button>
            </motion.div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Toggle Section */}
        <div className="p-2">
          <div className="flex items-center justify-between py-2 px-2">
            <div className="flex items-center gap-2">
              {mounted && resolvedTheme === 'dark' ? <Moon size={16} className="text-gray-500" /> : <Sun size={16} className="text-gray-500" />}
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch 
              checked={mounted && resolvedTheme === 'dark'} 
              onCheckedChange={toggleTheme} 
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Logout Section */}
        <div className="p-2">
          <motion.div whileHover={{ backgroundColor: "#FEF2F2" }} className="rounded-md">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </motion.div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountDropdown;