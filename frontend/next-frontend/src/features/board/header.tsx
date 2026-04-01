"use client"

import React from 'react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import Button from '@/src/component/button';


const Header: React.FC = () => (
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-medium">Kanban board</h1>
    <Link href="https://github.com/OMODON-ETEMI" passHref>
        <Button variant='primary' icon={<FaGithub />}>Github Repo</Button>
    </Link>
  </div>
);

export default Header;