import React from 'react';
import {
  Search, Settings, Plus, Trash2, Edit,
  ArrowUp, Minus, ArrowDown, Layout, Truck, AlertCircle, FileText, BarChart2,
  Menu, X, Clock, ChevronDown, ArrowLeftCircle, ChevronUp,
  ChevronLeft, ChevronRight, HelpCircle, Link, MoreVertical, Paperclip,
  MessageSquare, Github, Calendar, ArrowLeft, ArrowRight, Zap,
  Check, CircleSmall, Bookmark, TrendingUp, TriangleAlert, ClipboardCheck, FlaskConical, PhoneCall
} from 'lucide-react';

export type IconType =
  | 'Bug' | 'task' | 'epic' | 'story' | 'search' | 'settings' | 'add'
  | 'delete' | 'edit' | 'priority_high' | 'priority_medium' | 'priority_low'
  | 'board' | 'shipping' | 'issues' | 'page' | 'reports'
  | 'menu' | 'close' | 'stopwatch' | 'arrowDown' | 'arrowLeftCircle'
  | 'arrowUp' | 'chevronDown' | 'chevronLeft' | 'chevronRight' | 'chevronUp'
  | 'help' | 'link' | 'more' | 'attach' | 'plus' | 'feedback' | 'trash'
  | 'github' | 'calendar' | 'arrowLeft' | 'arrowRight' | 'subtask' 
  | 'improvment' | 'spike' | 'incident'| 'servicerequest';

type Priority = 'high' | 'medium' | 'low';

const iconMap: Record<IconType, React.ComponentType<any>> = {
  Bug: CircleSmall,
  task: Check,
  epic: Zap,
  story: Bookmark,
  subtask: ClipboardCheck,
  improvment: TrendingUp,
  spike: FlaskConical,
  incident: TriangleAlert,
  servicerequest: PhoneCall,
  search: Search,
  settings: Settings,
  add: Plus,
  delete: Trash2,
  edit: Edit,
  priority_high: ArrowUp,
  priority_medium: Minus,
  priority_low: ArrowDown,
  board: Layout,
  shipping: Truck,
  issues: AlertCircle,
  page: FileText,
  reports: BarChart2,
  menu: Menu,
  close: X,
  stopwatch: Clock,
  arrowDown: ChevronDown,
  arrowLeftCircle: ArrowLeftCircle,
  arrowUp: ChevronUp,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  help: HelpCircle,
  link: Link,
  more: MoreVertical,
  attach: Paperclip,
  plus: Plus,
  feedback: MessageSquare,
  trash: Trash2,
  github: Github,
  calendar: Calendar,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
};

export const issueTypeColors: Record<string, string> = {
  Bug: '#f57a6e',     // Red
  task: '#7cadf7',    // Blue
  "sub-task": '#97A0AF',  // Grey
  story: '#4BADE8', // Green
  epic: '#674399',   // Purple
  spike: '#FF991F', // Orange
  incident: '#253858', // Dark Blue
  servicerequest: '#00A3BF', // Teal
  improvment: '#34B37C', // Light Green
};

export const priorityColors: Record<Priority, string> = {
  high: '#E5493A',    // Red
  medium: '#E97F33',  // Orange
  low: '#2D8738',     // Green
};


interface IconProps {
  type: IconType | Priority | string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isIssueType?: boolean;
  isPriority?: boolean;
  showBackground?: boolean;
  top?: number;
  left?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({
  type,
  size = 16,
  className = '',
  isIssueType = false,
  isPriority = false,
  color = 'currentColor'
}) => {
  let iconType = type as IconType;
  let iconColor = color;

  if (isPriority) {
    iconType = `priority_${type.toLowerCase()}` as IconType;
    iconColor = priorityColors[type as Priority] || 'currentColor';
  } else if (isIssueType) {
    iconColor = issueTypeColors[type as string] || 'currentColor';
  }

  const IconComponent = iconMap[iconType] || iconMap.help;

  const sizeValue = typeof size === 'number' ? size : {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }[size] || 16;

  return (
    <div
    className={`inline-flex items-center justify-center rounded-sm ${className}`}
    style={{
      backgroundColor: iconColor,
      width: sizeValue + 8,
      height: sizeValue + 8,
    }}
  >
    <IconComponent
    size={sizeValue}
    className={className}
    color="white"
  />
  </div>
  );
};

export default Icon;