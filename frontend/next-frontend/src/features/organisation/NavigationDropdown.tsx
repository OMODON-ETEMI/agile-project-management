"use client"
// components/NavigationDropdown.tsx
import React, { useEffect, useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardHeader, CardContent } from "@/components/ui/card";
import { AssignedToMeModal, RecentOrganisationsInline, RecentWorkInline } from './navigationContent';
import Button from '@/src/components/ui/button';
import { recentOrganisation } from '@/src/lib/api/organisation';
import { Organisation } from '@/src/helpers/type';
import { useRecentWorkspaces, useWorkspaceExtras } from '@/src/hooks/useWorkspace';
import JiraCreateIssueModal from '@/src/constants/createIssue';
import useIssues from '@/src/hooks/useIssues';


// Comprehensive Type Definitions
type ActionType = 'modal' | 'inline' | 'page-redirect';

interface NavigationAction {
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  component?: React.ReactNode | (() => React.ReactNode);
  type?: ActionType;
  href?: string;
}

interface ViewAllOption {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavigationMenuItem {
  title: string;
  actions: NavigationAction[];
  viewAllOption?: ViewAllOption;
}

const NavigationDropdown: React.FC = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<NavigationAction | null>(null);
  const [organisation, setOrganisation] = useState<Organisation[] | null>(null);
  const { data: workspaces, isLoading } = useRecentWorkspaces(true);
  const { epicData: epics, createIssueAsync} = useIssues({ workspaceId: workspaces ? workspaces[0]._id : undefined, enable: !!workspaces });
  const { users } = useWorkspaceExtras(workspaces ? workspaces[0]._id : undefined, { users: true, boards: false });
  const { boards } = useWorkspaceExtras(workspaces ? workspaces[0]._id : undefined, { users: false, boards: true });

  useEffect(() => {
    const fetchRecentOrganisation = async () => {
      try {
        const data = await recentOrganisation();
        setOrganisation(data);
      } catch (error) {
        console.error('Error fetching recent organisation:', error);
      }
    };

    fetchRecentOrganisation();
  },[])
  
const menuItems: NavigationMenuItem[] = [
  {
    title: "Your Work",
    actions: [
      { 
        label: "Assigned to Me", 
        type: 'modal',
        component: () => <AssignedToMeModal />
      },
      { 
        label: "Recent", 
        type: 'inline',
        component: () => <RecentWorkInline />
      },
      { 
        label: "Boards", 
        type: 'page-redirect',
        href: "/boards"
      }
    ],
    viewAllOption: {
      label: "Go to Your Work",
      href: "/your-work"
    }
  },
  {
    title: "Organizations",
    actions: [
      { 
        label: "Recent Organizations", 
        type: 'inline',
        component: () => <RecentOrganisationsInline data={organisation} />
      },
    ],
    viewAllOption: {
      label: "View All Organizations",
      href: "/organisations"
    }
  }
];

  const renderDropdownContent = (menuItem: NavigationMenuItem) => {
    // Determine layout based on action types
    const isHorizontalLayout = menuItem.actions.some(action => action.type === 'inline');
    
    return (
      <DropdownMenuContent >

        {/* <Card className="w-full max-w-md shadow-sm"> */}
        <CardHeader className="p-1">
          <div className="flex justify-center">
            {menuItem.actions.map((item) => (
              <DropdownMenuItem
                key={item.label}
                disabled={item.disabled}
                className={`
                cursor-pointer text-sm
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${isHorizontalLayout ? 'flex flex-col items-center p-1' : 'flex items-center'}
              `}
                onSelect={(e) => {
                  e.preventDefault()
                  if (item.component) {
                    setSelectedAction(item);
                  }
                }}
              >
                <div
                  key={item.label}
                  className={`h-4 text-xs ${item.label === selectedAction?.label ? "text-blue-600" : "text-muted-foreground"
                    }`}
                >
                  <span className='mx-1'> {item.label}</span>
                  {item.label === selectedAction?.label && (<span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-600 transition-all duration-300 z-10"></span>)}
                  <span className="absolute left-0 bottom-0 h-0.5 w-full bg-gray-300 transition-all duration-300"></span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-start py-4">
          {selectedAction?.component && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {typeof selectedAction.component === 'function'
                ? selectedAction.component()
                : selectedAction.component}
            </motion.div>
          )}
        </CardContent>
      </DropdownMenuContent>
    );
  };

  return (
    <nav className='flex gap-2'>
      {menuItems.map((menuItem) => (
        <DropdownMenu
          key={menuItem.title}
          open={activeMenuItem === menuItem.title}
          onOpenChange={(open) => {
            // Only handle clicks outside, not trigger clicks
            if (!open) {
              // Check if we're clicking another trigger before closing
              const isClickingAnotherTrigger = document.activeElement?.closest('[data-dropdown-trigger]');

              if (!isClickingAnotherTrigger) {
                setActiveMenuItem(null);
              }
            }
          }}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={activeMenuItem === menuItem.title ? "primary" : "empty"}
              data-dropdown-trigger={menuItem.title}
              onClick={(e) => {
                // Stop event from bubbling to prevent dropdown's close handler
                e.stopPropagation();

                // Always set this item as active
                setActiveMenuItem(menuItem.title);
                setSelectedAction(menuItem.actions[0] || null);
              }}
            >
              <span className='flex items-center text-xs'>
                {menuItem.title}
                <ChevronDown className="" size={10} />
              </span>
            </Button>
          </DropdownMenuTrigger>
          {renderDropdownContent(menuItem)}
        </DropdownMenu>
      ))}
      {/* Create Button */}
      {workspaces && (
        <JiraCreateIssueModal epics={epics} users={users} boards={boards} onSubmit={(data) => createIssueAsync({...data, workspace_id: workspaces ? workspaces[0]._id : undefined})} onClose={() => {}}/>
    )}
    </nav>
  );
};

export default NavigationDropdown;