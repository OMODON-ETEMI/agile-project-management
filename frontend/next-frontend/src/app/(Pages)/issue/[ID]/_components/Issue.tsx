import React, { Fragment } from 'react';
import { DefaultBoardStatuses, IssueStatus, IssueStatusCopy } from '@/src/helpers/status';
import SectionTitle from '@/src/component/sectiontitle';
import Icon from '@/src/helpers/icon';
import { Project, User } from '@/src/helpers/type';
import Select from '@/src/component/select';
import { UpdateProjects } from '@/src/helpers/getData';


// type Issue = {
//   status: string;
// };

interface ProjectBoardIssueDetailsStatusProps {
  issue: Project;
  currentUser: User
}

const IssueDetailsStatus: React.FC<ProjectBoardIssueDetailsStatusProps> = ({ issue, currentUser }) => {
  const updateStatus = async (newStatus: any) => {
    const update = {
      status: newStatus,
      ID: issue._id,
      user_id: currentUser.user_id
    }
    try {
      await UpdateProjects(update)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <Fragment>
      <SectionTitle>Status</SectionTitle>
      <div className="relative w-80">
        <Select
          name="Status"
          placeholder='Status'
          value={Object.entries(IssueStatus).find(([key, value]) => value === issue.status)?.[1]} 
          variant='empty'
          className="block z-50 w-full p-2.5 text-sm bg-gray-100 border border-gray-300 rounded 
          focus:ring-blue-500 focus:border-blue-500" 
          options={Object.entries(IssueStatus).map(([key, value]) => ({
            value: value,
            label: key,
          }))}
          onChange={(newStatus) => updateStatus(newStatus)}
          />
      </div>
    </Fragment>
  );
};

export default IssueDetailsStatus;
