"use client"

import React, { useMemo } from 'react';
import BoardCard from './board-card';
import { FilterState, Issue, Project, User } from '@/src/helpers/type';
import { DefaultBoardStatuses, IssueStatus, IssueStatusCopy } from '@/src/helpers/status';
import { filterIssues } from '@/src/helpers/issueFilter';
import { useDroppable } from '@dnd-kit/core';


interface BoardColumnProps {
  cards: (Project | Issue) [];
  users: User[];
  status : string;
  filterState: FilterState;
  mergeState: (newState: Partial<FilterState>) => void;
  initialState: FilterState;
  currentUser: User
}

const BoardColumn: React.FC<BoardColumnProps> = ({ status, cards, users, currentUser, filterState}) => {

  const filteredIssues = useMemo(() => {
    const filteredCards = filterIssues(cards, {
      ...filterState, 
      currentUser
    });
    return filteredCards.filter((card : Project | Issue) => card.status.toLowerCase() === status.toLowerCase());
  }, [cards, filterState, status, currentUser])

  const displayedIssues = useMemo(() => {
    const MAX_CARDS_PER_COLUMN = 10;
    return filteredIssues.slice(0, MAX_CARDS_PER_COLUMN);
  }, [filteredIssues]);

  const cardCounts = useMemo(() => {
    const totalStatusCards = cards.filter(
      card => card.status.toLowerCase() === status.toLowerCase()
    ).length;

    return {
      filteredCount: filteredIssues.length,
      totalCount: totalStatusCards
    };
  }, [cards, filteredIssues, status]);

    const { setNodeRef } = useDroppable({
      id: status
    });



  // const filterIssue = ( cards: (Project | Task) []) => {

  //     const {searchTerm, userIds, myOnly, recent  } = filterState
    
  //   let filteredCards = cards

  //   if(searchTerm) {
  //     console.log('Filter state', searchTerm)
  //     filteredCards = filteredCards.filter(card => card.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()))
  //   }

  //   if (userIds.length > 0) {
  //     console.log('UserIDs', userIds)
  //     filteredCards = filteredCards.filter(issue => userIds.includes(issue.user_id));
  //     console.log('filtered cards', filteredCards)
  //   }
  //   if (myOnly && currentUser) {
  //     filteredCards = filteredCards.filter(issue => issue.user_id.includes(currentUser.user_id));
  //   }
  //   // if (recent) {
  //   //   filteredCards = filteredCards.filter(issue => moment(issue.updatedAt).isAfter(moment().subtract(3, 'days')));
  //   // }
  //   // pending more functions
  //   return filteredCards
  // }
  


  // const FilterListCard = (cards:(Project | Task) [], status: string) => {
  //   const filtered = cards.filter(card => card.status.toLowerCase() === status.toLowerCase())
  //   return filtered
  // }
  // const filteredIssues = filterIssue(cards)
  // const allListCard = FilterListCard(cards, status)
  // const FilteredListCard = FilterListCard(filteredIssues, status) 

  // const formatCardCount = (allListCard:(Project | Task)[], filteredListCard:(Project | Task)[]) => {
  //   if (allListCard.length !== filteredListCard.length) {
  //     return `${filteredListCard.length} of ${allListCard.length}`;
  //   }
  //   return allListCard.length;
  // };

  return (
    <div ref={setNodeRef} 
      className="flex flex-col mx-[5px] w-1/4 rounded-[3px] bg-gray-100 shadow-sm">
    {/* Column Header */}
    <div className="py-[13px] px-2.5 pb-[17px] uppercase text-gray-600 text-[12.5px] flex items-center justify-between">
      <div className="flex items-center">
        <span>{IssueStatusCopy[status]}</span>
        <span className="ml-2 lowercase text-[13px] font-normal text-gray-500">
          {cardCounts.filteredCount !== cardCounts.totalCount 
            ? `${cardCounts.filteredCount} of ${cardCounts.totalCount}` 
            : cardCounts.totalCount}
        </span>
      </div>
      {filteredIssues.length > 10 && (
        <span className="text-xs text-gray-400">
          +{filteredIssues.length - 10} more
        </span>
      )}
    </div>
  
    {/* Issues Container */}
    <div className="px-[5px] space-y-2">
      {displayedIssues.map((card) => (
        <BoardCard 
          key={card._id}  
          card={card} 
          user={users.find(user => user.user_id === card.user_id)} 
          CurrentUser={currentUser}
        />
      ))}
    </div>
  
    {/* Empty State
    {displayedIssues.length === 0 && (
      <div className="text-center text-gray-400 py-4">
        No issues in this status
      </div>
    )} */}
  </div>
  );
};

export default React.memo(BoardColumn);
