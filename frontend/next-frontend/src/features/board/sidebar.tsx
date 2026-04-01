'use client';


// components/ProjectSidebar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/src/helpers/icon';
import { Board } from '@/src/helpers/type';
import Image from 'next/image';
// import { Icon, ProjectAvatar } from '../shared/components';

interface boardSidebarProps {
  board: Board;
}

const BoardSidebar = ({ board }: boardSidebarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderLinkItem = (text: string, iconType: string, path?: string) => {
    const isImplemented = !!path;
    const href = path ? `${router.push}${path}` : '#';

    return (
      <Link href={href} passHref>
        <div className={`relative flex p-2 rounded cursor-pointer ${isImplemented ? 'hover:bg-gray-100' : 'cursor-not-allowed'}`}>
          <Icon type={iconType as any} className="mr-4 text-xl" />
          <div className="pt-0.5 text-sm">{text}</div>
          {!isImplemented && (
            <div className="absolute top-2 left-10 w-36 p-1 pl-2 rounded uppercase text-xs font-bold text-gray-800 bg-gray-300 opacity-0 hover:opacity-100 transition-opacity">
              Not implemented
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
    {/* Hamburger menu for small screens */}
    <div className="lg:hidden fixed top-2 right-6 z-50">
      <button onClick={toggleSidebar} className="p-2 rounded-lg bg-gray-200">
        <Icon type="menu" className="text-2xl" />
      </button>
    </div>

    {/* Sidebar */}
    <div className={`fixed z-[1] top-0 left-0 h-screen w-[240px] p-4 bg-white border-r border-gray-100 
      overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
      transition-transform duration-300 ease-in-out
      lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Close button for small screens */}
      <button onClick={toggleSidebar} className="lg:hidden absolute top-4 right-4">
        <Icon type="close" className="text-2xl" />
      </button>

      <div className="flex py-6 px-1">
        <Image 
          src={board.image.imageFullUrl} 
          alt={board.title} 
          width={40} 
          height={40} 
          className=" object-cover"
        />
        <div className="pl-2.5 pt-0.5">
          <div className="text-sm font-medium text-gray-800">{board.title.toUpperCase()}</div>
          <div className="text-sm text-gray-800">Projectg category</div>
        </div>
      </div>
      {renderLinkItem('Kanban Board', 'board', '/board')}
      {renderLinkItem('Project settings', 'settings', '/settings')}
      <div className="mt-4 pt-4 border-t border-gray-200"></div>
      {renderLinkItem('Releases', 'shipping')}
      {renderLinkItem('Issues and filters', 'issues')}
      {renderLinkItem('Pages', 'page')}
      {renderLinkItem('Reports', 'reports')}
      {renderLinkItem('Components', 'component')}
    </div>
  </>
  );
};

export default BoardSidebar;