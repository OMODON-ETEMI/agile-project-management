import React from 'react';

const SidebarSkeleton = () => {
  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Pro Features Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Planning Section */}
      <div className="p-4 flex-1">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-20"></div>
        
        <div className="space-y-3">
          {/* Timeline */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          
          {/* Backlog - Active state */}
          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
          </div>
          
          {/* Board */}
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
          </div>
        </div>

        {/* Development Section */}
        <div className="mt-8">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-24"></div>
          
          <div className="space-y-3">
            {/* Release */}
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            
            {/* Code */}
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Add Shortcut */}
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
        
        {/* Settings */}
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        
        {/* Notifications */}
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse ml-auto"></div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
      </div>
    </div>
  );
};

export default SidebarSkeleton;