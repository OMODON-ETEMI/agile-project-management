import React, { Fragment } from "react";
import { Project, User} from '@/src/helpers/type'
import Select from '@/src/component/select';
import Icon from "@/src/helpers/icon";
import { ISSUEPRIORITY } from "@/src/helpers/status";
import { UpdateProjects } from "@/src/helpers/getData";

// import { IssuePriority, IssuePriorityCopy } from "shared/constants/issues";
// import { Select, IssuePriorityIcon } from "shared/components";

   interface Priority {
  issue: Project
  CurrentUser: User
};

const Priority = ({ issue, CurrentUser } : Priority) => {
    // const issueOptions = users.map(user => ({ value: user.user_id, label: user.first_name }));
    const updateIssue = async ( priority: { priority: keyof typeof ISSUEPRIORITY}) => {
      const update = {
        ID: issue._id,
        user_id: CurrentUser.user_id,
        ...priority,
      }
      try {
        await UpdateProjects(update)
      } catch (error) {
        console.error(error)
      }
    }

    return (
        <Fragment>
          <h3 className="text-lg font-semibold mb-2">Priority</h3>
          <Select
            variant="empty"
            withClearValue={false}
            dropdownWidth={343}
            name="priority"
            value={issue.priority}
            options={Object.keys(ISSUEPRIORITY).map((priority) => ({
              value: priority,
              label: ISSUEPRIORITY[priority as keyof typeof ISSUEPRIORITY],
            }))}
            onChange={(priority) => updateIssue({ priority: priority as keyof typeof ISSUEPRIORITY })}
            renderValue={({ value: priority }) =>
              renderPriorityItem(priority as keyof typeof ISSUEPRIORITY, true)
            }
            renderOption={({ value: priority }) => renderPriorityItem(priority as keyof typeof ISSUEPRIORITY, false )}
          />
        </Fragment>
      )
};

const renderPriorityItem = ( issue: keyof typeof ISSUEPRIORITY, isValue: boolean) => (
  <div
    className={`flex items-center min-w-[100px] ${
      isValue
        ? "p-[3px] pl-0 pr-[4px] rounded-md hover:bg-gray-100 focus:bg-gray-100"
        : ""
    }`}
  >
    <Icon type={issue} isPriority={true}/>
    <span className="pl-2 pr-1 text-sm whitespace-nowrap">{ISSUEPRIORITY[issue]}</span>
  </div>
);

export default Priority;
