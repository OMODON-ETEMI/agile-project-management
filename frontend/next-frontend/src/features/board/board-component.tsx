"use client"

import React, { useEffect, useState } from 'react';
import BoardColumn from './board-column';
import { Project, User } from '@/src/helpers/type';
import { DefaultBoardStatuses, IssueStatus } from '@/src/helpers/status';
import Filters from './filter';
import { useFilterState } from '@/src/component/filterstate';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { usePathname, useRouter } from 'next/navigation';
import Modal from '@/src/component/modal';
import CardIssueDetails from '@/src/app/(Pages)/workspace/[workspaceID]/[BoardID]/issue/[ID]/page';
import { map } from 'lodash';
import { UpdateProjects } from '@/src/helpers/getData';
import { getSocket } from '@/src/helpers/socket';


interface BoardProps {
  // columns: { title: string; cards: { title: string; description: string }[] }[];
  list : (Project ) [] 
  users : User[]
  currentUser: User
}

const BoardView: React.FC<BoardProps> = ({list, users, currentUser,} : BoardProps) => {
  const {filterState, mergeState, initialState} = useFilterState()
  const [cards, setCards] = useState< typeof list>(list)
  const socket = getSocket()

  useEffect(() => {
    try {
      socket.on('ProjectUpdated', (updatedProject: Project ) => {
        console.log("Project updated:", updatedProject);
        setCards( cards => 
          cards.map((card) => card._id === updatedProject._id ?
           { ...updatedProject} 
           : card))
      });
      return () => {
        socket.off("ProjectUpdated");
      };
    } catch (error) {
      console.error(error)
    }
  },[])
  
  async function handleDragEnd(event : DragEndEvent){
    const { active, over } = event;
    console.log('Active ID: ', active.id, "\nOver ID: ", over?.id)

    if(!over || active.id === over.id) return;

    const taskId = active.id as string
    const newStatus = over.id as Project ['status']

    try {
      setCards(() => 
        cards.map((task) => 
          task.name === taskId ? {
            ...task,
            status: newStatus
          } : task ))
    
          const task = cards.find((task) => task.name === taskId)
    
          const update = {
            status: newStatus,
            ID: task?._id as string,
            user_id: currentUser.user_id,
          };
          console.log('update for DND: ', update)
    
          await UpdateProjects(update)
    } catch (error) {
      console.error(error)
    }

  }


  return (
    <>
    <Filters users={users} filterState={filterState} mergeState={mergeState} initialState={initialState}/> 
    <div className="flex mx-[-5px] mt-[26px]">
      <DndContext onDragEnd={handleDragEnd}>
        {Object.values(DefaultBoardStatuses).map((status) => (
          <BoardColumn key={status} users={users} cards={cards} status={status} currentUser={currentUser} filterState={filterState} mergeState={mergeState} initialState={initialState} />
        ))}
      </DndContext>
    </div>
    </>
  );
};

export default BoardView;
