import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faHeart, faBook, faBriefcase, faDollarSign, faUsers, 
  faPlane, faGamepad, faHandshake, faEllipsisH, faLaptop, 
  faPaintBrush, faLightbulb, faChevronUp, faColumns, faCog, 
  faShippingFast, faExclamationCircle, faFileAlt, faChartBar, faPuzzlePiece
} from '@fortawesome/free-solid-svg-icons';

type Category = 
| 'Home & Family'
| 'Health & Wellness'
| 'Education & Learning'
| 'Work & Career'
| 'Finance & Budgeting'
| 'Social & Relationships'
| 'Travel & Leisure'
| 'Hobbies & Interests'
| 'Community & Volunteering'
| 'Miscellaneous'
| 'Technology & Gadgets'
| 'Arts & Creativity'
| 'Personal Development';

type CategoryIconMapping = {
[key in Category]: { icon: any; color: string };
};


const categoryIconMap: CategoryIconMapping = {
    'Home & Family': { icon: faHome, color: '#FF5733' },
    'Health & Wellness': { icon: faHeart, color: '#C70039' },
    'Education & Learning': { icon: faBook, color: '#900C3F' },
    'Work & Career': { icon: faBriefcase, color: '#581845' },
    'Finance & Budgeting': { icon: faDollarSign, color: '#FFC300' },
    'Social & Relationships': { icon: faUsers, color: '#DAF7A6' },
    'Travel & Leisure': { icon: faPlane, color: '#FF5733' },
    'Hobbies & Interests': { icon: faGamepad, color: '#C70039' },
    'Community & Volunteering': { icon: faHandshake, color: '#900C3F' },
    'Miscellaneous': { icon: faEllipsisH, color: '#581845' },
    'Technology & Gadgets': { icon: faLaptop, color: '#FFC300' },
    'Arts & Creativity': { icon: faPaintBrush, color: '#DAF7A6' },
    'Personal Development': { icon: faLightbulb, color: '#FF5733' }
  };
  
  export const getCategoryIcon = (category: Category) => {
    return categoryIconMap[category];
  };

  type Priority = 'High' | 'Medium' | 'Low';

  type PriorityIconMapping = {
    [key in Priority]: { icon: any; color: string };
  };


const priorityIconMap: PriorityIconMapping = {
    High: { icon: faChevronUp, color: '#FF0000' },
    Medium: { icon: faChevronUp, color: '#FFA500' },
    Low: { icon: faChevronUp, color: '#0000FF' }
};

export const getPriorityIcon = (priority: Priority) => {
return priorityIconMap[priority];
};


type SidebarIcon = 
  | 'board'
  | 'settings'
  | 'shipping'
  | 'issues'
  | 'page'
  | 'reports'
  | 'component';

type SidebarIconMapping = {
  [key in SidebarIcon]: any;
};

const sidebarIconMap: SidebarIconMapping = {
  board: faColumns,
  settings: faCog,
  shipping: faShippingFast,
  issues: faExclamationCircle,
  page: faFileAlt,
  reports: faChartBar,
  component: faPuzzlePiece
};

export const getSidebarIcon = (iconType: SidebarIcon) => {
  return sidebarIconMap[iconType];
};