import React, { useState, FormEvent, useCallback, useMemo } from 'react';
import * as Yup from 'yup';
import { CreateProjects, getAccessUserBoard } from '../helpers/getData';
import { User } from '../helpers/type';
import { ISSUEPRIORITY, ProjectStatus } from '../helpers/status';
import Select from './select';
import Icon from '../helpers/icon';
import Button from './button';
import Avatar from './avatar';
import Spinner from './skeleton';
import { handleAxiosError } from '../helpers/response-handler';

interface ProjectIssueCreateProps {
    currentUser: User;
    modalClose: () => void;
}

interface FormValues {
  title: string;
  description: string;
  reporterId: string;
  team: string[];
  priority: (typeof ISSUEPRIORITY)[keyof typeof ISSUEPRIORITY];
  status: (typeof ProjectStatus)[keyof typeof ProjectStatus];
}

const ProjectCreate: React.FC<ProjectIssueCreateProps> = ({ modalClose, currentUser }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: '',
    description: '',
    reporterId: currentUser.user_id,
    team: [],
    priority: ISSUEPRIORITY.Low,
    status: ProjectStatus.PLANNING
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await getAccessUserBoard(board_id as string);
        if (fetchedUsers) {
          setUsers(fetchedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [board_id]);
  

  // In your render method, handle loading state
  if (isLoading) {
    return <Spinner /> ;
  }

  const validateForm = async () => {
    try {
      const schema = Yup.object({
        title: Yup.string().required('Title is required').max(200, 'Title must be 200 characters or less'),
        board_id: Yup.string().required('This Project must belong to a board to be visible'),
        reporterId: Yup.string().required('Reporter is required'),
        priority: Yup.string().required('Priority is required'),
        status: Yup.string().required('Status is required'),
        description: Yup.string().optional().max(1000, 'Description must be 1000 characters or less'),
        team: Yup.array().of(Yup.string()).min(1, 'At least one team member is required'),
      });
      

      await schema.validate(formValues, { abortEarly: false });
      return true;
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        const errorMap: Partial<Record<keyof FormValues, string>> = {};
        validationError.inner.forEach((error) => {
          if (error.path) {
            errorMap[error.path as keyof FormValues] = error.message;
          }
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setIsCreating(true);
      await CreateProjects(formValues);
      modalClose();
    } catch (error) {
      handleAxiosError(error)
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriorityChange = (newPriortiy: (typeof ISSUEPRIORITY)[keyof typeof ISSUEPRIORITY]) => {
    setFormValues(prev => ({
      ...prev,
      priority: newPriortiy as (typeof ISSUEPRIORITY)[keyof typeof ISSUEPRIORITY]
    }));
  };

  const handleStatusChange = (newStatus: (typeof ProjectStatus)[keyof typeof ProjectStatus]) => {
    setFormValues(prev => ({
      ...prev,
      status: newStatus as (typeof ProjectStatus)[keyof typeof ProjectStatus]
    }));
  };

  const handleReporterChange = (newReporterId: string) => {
    setFormValues(prev => ({
      ...prev,
      reporterId: newReporterId as string
    }));
  };

  const handleTeamChange = (newTeam: string[]) => {
    setFormValues(prev => ({
      ...prev,
      team: newTeam
    }));
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

  const userMap = useMemo(
    () => new Map(users.map(user => [user.user_id, user])),
    [users]
  );

  const getUserById = useCallback(
    (userId: string | number): User | undefined => userMap.get(String(userId)),
    [userMap]
  );

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Issue</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Issue Type</label>
        <Select
          placeholder='Status'
          variant='empty'
          value={formValues.status}
          className="w-full p-2 border rounded" 
          options={Object.entries(ProjectStatus).map(([key, value]) => ({
            value: value,
            label: key,
          }))}
          onChange={(newStatus) => handleStatusChange(newStatus as string)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Title</label>
        <input 
          type="text" 
          name="title" 
          value={formValues.title}
          onChange={handleChange}
          placeholder="Enter a short summary" 
          className="w-full p-2 border rounded" 
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Description</label>
        <textarea 
          name="description"
          value={formValues.description}
          onChange={handleChange}
          className="w-full p-2 border rounded" 
          rows={4} 
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Reporter</label>
        <Select
          placeholder='Reporter'
          variant='empty'
          value={formValues.reporterId}
          className="w-full p-2 border rounded" 
          options={users.map(user => ({
            value: user.user_id,
            label: user.first_name
          }))}
          onChange={(newReporterId) => handleReporterChange(newReporterId as string)}
          renderValue={({ value, removeOptionValue }) => renderUser(getUserById(value), true, removeOptionValue)}
          renderOption={(option) => renderUser(getUserById(option.value), false)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Assignees</label>
        <Select
        isMulti
          placeholder='Assignees'
          variant='empty'
          value={formValues.team}
          className="w-full p-2 border rounded" 
          options={users.map(user => ({
            value: user.user_id,
            label: user.first_name
          }))}
          onChange={(newTeam) =>{
            const userIds = newTeam as string[]
            handleTeamChange(userIds)
          }}
          renderValue={({ value, removeOptionValue }) =>
            renderUser(getUserById(value), true, removeOptionValue)
          }
          renderOption={(option) => renderUser(getUserById(option.value), false)}
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Priority</label>
        <Select
          placeholder='Priority'
          variant='empty'
          value={formValues.priority}
          className="w-full p-2 border rounded" 
          options={Object.entries(ISSUEPRIORITY).map(([key, value]) => ({
            value: value,
            label: key,
          }))}
          onChange={(newPriortiy) => handlePriorityChange(newPriortiy as string)}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button 
          variant='primary' 
          isWorking={isCreating} 
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isCreating ? 'Creating...' : 'Create Issue'}
        </Button>
        <Button 
          onClick={modalClose} 
          variant='empty'
          className="px-4 py-2 bg-gray-500 text-white rounded"
          icon="close"
        />
      </div>
    </form>
  );
};

export default ProjectCreate;