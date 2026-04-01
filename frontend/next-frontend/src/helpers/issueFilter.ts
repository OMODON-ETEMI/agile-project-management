import { Issue, User, FilterState } from '@/src/helpers/type';

interface FilterOptions extends FilterState {
  currentUser?: User;
}

const notStartedStatuses = ['todo', 'to do', 'backlog'];
const inProgressStatuses = ['in progress', 'reviewing', 'blocked'];
const completedStatuses = ['done', 'completed', 'closed'];

export const isNotStarted = (status: string) => 
  notStartedStatuses.includes(status.toLowerCase())

export const isInProgress = (status: string) =>
  inProgressStatuses.includes(status.toLowerCase());

export const isCompleted = (status: string) =>
  completedStatuses.includes(status.toLowerCase());

export const filterIssues = (cards: Issue [], options: FilterOptions): Issue[] => {
  const { 
    searchTerm, 
    userIds, 
    myOnly, 
    recent, 
    currentUser 
  } = options;

  let filteredCards = [...cards];

  // Search by name (case-insensitive)
  if (searchTerm) {
    filteredCards = filteredCards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by specific users
  if (userIds && userIds.length > 0) {
    filteredCards = filteredCards.filter(issue => 
      userIds.includes(issue.creator)
    );
  }

  // Show only current user's issues
  if (myOnly && currentUser) {
    filteredCards = filteredCards.filter(issue => 
      issue.creator === currentUser.user_id
    );
  }

  // Recent filter (last 3 days)
  if (recent) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 3);

    filteredCards = filteredCards.filter(issue => {
      const updatedAt = issue.updatedAt instanceof Object 
        ? new Date(issue.createdAt) 
        : new Date(issue.updatedAt);
      return updatedAt > thresholdDate;
    });
  }

  return filteredCards;
};