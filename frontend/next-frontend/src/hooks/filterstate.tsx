// hooks/useFilterState.ts

import { useState } from 'react';
import { FilterState } from '../helpers/type';

const initialState: FilterState = {
  searchTerm: '',
  userIds: [],
  myOnly: false,
  recent: false
};

export const useFilterState = () => {
  const [filterState, setFilterState] = useState<FilterState>(initialState);

  const mergeState = (newState: Partial<FilterState>) => {
    setFilterState(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  return { filterState, initialState, mergeState };
};