import React, { Fragment, useCallback, useMemo } from 'react';
import Select from '@/src/component/select';
import Avatar from '@/src/component/avatar';
import Icon from '@/src/helpers/icon';
import { Project, User } from '@/src/helpers/type';
import { getAccessUserBoard, UpdateProjects } from '@/src/helpers/getData';

interface ProjectBoardIssueDetailsAssigneesReporterProps {
    issue: Project
    CurrentUser: User
}

const AssigneesReporter: React.FC<ProjectBoardIssueDetailsAssigneesReporterProps> = ({ issue, CurrentUser }) => {
  const [users, setUsers] = React.useState<User[]>([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getAccessUserBoard(issue.board_id as string);
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, [issue.board_id]);

  const userMap = useMemo(
    () => new Map(users.map(user => [user.user_id, user])),
    [users]
  );

  const getUserById = useCallback(
    (userId: string | number): User | undefined => userMap.get(String(userId)),
    [userMap]
  );

  const userOptions = users.map(user => ({
    value: user.user_id,
    label: user.first_name,
  }));

  const updateIssue = async (userIds: string[]) => {
    const updateUser = issue.team.filter(userId =>
      userIds.includes(userId)
    );
    const newUser = userIds.filter(
      userId => !issue.team.includes(userId)
    );

    const update = {
      team: [...updateUser, ...newUser],
      ID: issue._id as string,
      user_id: CurrentUser.user_id,
    };

    try {
      // Optimistic update
      setUsers(prevUsers =>
        prevUsers.map(user =>
          userIds.includes(user.user_id) ? { ...user } : user
        )
      );
    await UpdateProjects(update);
    } catch (error) {
      console.error('Error updating users:', error);
    }
  };


  const renderUser = useCallback((user: User | undefined, isSelectValue: boolean, removeOptionValue?: () => void) => {
    if (!user) return null;
    return (
      <div
        key={user.user_id}
        className={`flex items-center ${isSelectValue ? 'm-2 p-2 bg-gray-200 rounded' : ''} cursor-pointer`}
        onClick={() => removeOptionValue && removeOptionValue()}
      >
        <Avatar avatarUrl={user.image.imageFullUrl} name={user.first_name} size={6} />
        <span className="ml-2 text-sm">{user.first_name}</span>
        {removeOptionValue && <Icon type="close" className="ml-2" />}
      </div>
    );
  }, []);

  return (
    <Fragment>
      <h3 className="font-bold mb-2">Assignees</h3>
      <Select
        isMulti
        placeholder="Unassigned"
        name="assignees"
        options={userOptions}
        value={issue.team}
        onChange={(selectedOptions) => {
          const userIds = selectedOptions as string[];
          updateIssue(userIds);
        }}
        renderValue={({ value, removeOptionValue }) =>
          renderUser(getUserById(value), true, removeOptionValue)
        }
        renderOption={(option) => renderUser(getUserById(option.value), false)}
      />

      <h3 className="font-bold mt-4 mb-2">Reporter</h3>
      <Select
        variant="empty"
        dropdownWidth={343}
        withClearValue={false}
        name="reporter"
        value={issue.creator as string}
        options={userOptions}
        onChange={(selectedOption) => {
          updateIssue(selectedOption as string[]);
        }}
        renderValue={({ value, removeOptionValue }) => renderUser(getUserById(value), true, removeOptionValue)}
        renderOption={(option) => renderUser(getUserById(option.value), false)}
      />
    </Fragment>
  );
};

export default AssigneesReporter;