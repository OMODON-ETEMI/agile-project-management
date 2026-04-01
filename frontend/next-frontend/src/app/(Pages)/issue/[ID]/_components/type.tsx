import React from 'react';
import { Project, Task } from '@/src/helpers/type';
import Icon from '@/src/helpers/icon';

interface ProjectBoardIssueDetailsTypeProps {
  card: Project | Task;
}

const BoardIssueDetails: React.FC<ProjectBoardIssueDetailsTypeProps> = ({ card }) => (
    <div 
      className="inline-flex items-center justify-center h-8 px-3 text-gray-700 hover:bg-gray-100" >
      <Icon type={card.category} className="mr-1" isIssueType={true} size={12} />
      <span>{`${card.category}-${card.projectID}`}</span>
    </div>
  );

export default BoardIssueDetails;