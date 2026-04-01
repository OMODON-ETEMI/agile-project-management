"use client"

import React from 'react';
import { xor } from 'lodash';
import { FiSearch } from 'react-icons/fi';
import { FilterState, User } from '@/src/helpers/type';

interface FiltersProps {
  users: User[];
  filterState: FilterState;
  mergeState: (newState: Partial<FilterState>) => void;
  initialState: FilterState;
}

const Filters: React.FC<FiltersProps> = ({
  users,
  filterState,
  mergeState,
  initialState
}) => {
  const { searchTerm, userIds, myOnly, recent } = filterState;

  const areFiltersCleared = !searchTerm && userIds.length === 0 && !myOnly && !recent;

  return (
    <div className="flex items-center mt-6" data-testid="board-filters">
      <div className="relative mr-4 w-40">
        <input
          type="text"
          className="w-[160px] pl-8 pr-2 py-1 border rounded text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => mergeState({ searchTerm: e.target.value })}
          placeholder="Search issues..."
        />
        <FiSearch className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
      </div>
      <div className="flex flex-row-reverse mx-3">
        {users.map((user) => (
          <div
            key={user.user_id}
            className={`inline-flex -ml-0.5 rounded-full transition-transform hover:-translate-y-1 cursor-pointer ${
              userIds.includes(user.user_id) ? 'ring-4 ring-blue-500' : ''
            }`}
            onClick={() => mergeState({ userIds: xor(userIds, [user.user_id]) })}
          >
            <img
              src={user.image.imageFullUrl}
              alt={user.first_name}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          </div>
        ))}
      </div>
      <button
        className={`ml-1.5 px-3 py-1.5 rounded text-sm font-medium ${
          myOnly
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => mergeState({ myOnly: !myOnly })}
      >
        Only My Issues
      </button>
      <button
        className={`ml-1.5 px-3 py-1.5 rounded text-sm font-medium ${
          recent
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => mergeState({ recent: !recent })}
      >
        Recently Updated
      </button>
      {!areFiltersCleared && (
        <button
          className="ml-4 pl-3 border-l text-sm text-gray-700 hover:text-gray-500"
          onClick={() => mergeState(initialState)}
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default Filters;