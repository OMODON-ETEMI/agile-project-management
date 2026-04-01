'use client'

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusIcon } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending' | 'Inactive';
  initialsColor: string;
}

const membersData: Member[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    initials: 'JD',
    role: 'Admin',
    status: 'Active',
    initialsColor: 'text-indigo-600 bg-indigo-100'
  },
  {
    id: 2,
    name: 'Sarah Adams',
    email: 'sarah@example.com',
    initials: 'SA',
    role: 'Editor',
    status: 'Pending',
    initialsColor: 'text-amber-600 bg-amber-100'
  },
  {
    id: 3,
    name: 'Marketing Team',
    email: 'marketing@example.com',
    initials: 'MT',
    role: 'Viewer',
    status: 'Inactive',
    initialsColor: 'text-red-600 bg-red-100'
  }
];

const statusColorMap = {
  'Active': 'text-emerald-600 bg-emerald-100',
  'Pending': 'text-amber-600 bg-amber-100',
  'Inactive': 'text-red-600 bg-red-100'
};

const MembersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = membersData.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">Members</h1>
        <p className="text-slate-500 mt-2">Total Members: {membersData.length}</p>

        <div className="mt-6 flex space-x-4">
          <div className="relative flex-grow">
            <Input 
              type="text" 
              placeholder="Search members..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <Button className='bg-indigo-500 hover:bg-indigo-600'>
            <PlusIcon className="mr-2" size={16} />Add Member
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {filteredMembers.map(member => (
            <Card key={member.id} className="flex items-center p-4 hover:shadow-md">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-6 ${member.initialsColor}`}>
                <span className="font-semibold">{member.initials}</span>
              </div>
              
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-slate-900">{member.name}</h2>
                <p className="text-slate-500 text-sm">{member.email}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                  {member.role} ▼
                </div>

                <div className={`px-3 py-2 rounded-lg ${statusColorMap[member.status]} bg-opacity-20`}>
                  {member.status}
                </div>

                <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg">
                  <PlusIcon size={20} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;