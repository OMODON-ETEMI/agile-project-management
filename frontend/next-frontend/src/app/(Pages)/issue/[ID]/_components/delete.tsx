"use client"

import React from 'react';
import { Project } from '@/src/helpers/type';
import { DeleteProject } from '@/src/helpers/getData';
import ConfirmModal from '@/src/component/confirm';
import Icon from '@/src/helpers/icon';
import Button from '@/src/component/button';

interface ProjectBoardIssueDetailsDeleteProps {
  card: Project;
}

const Delete: React.FC<ProjectBoardIssueDetailsDeleteProps> = ({ 
  card, 
}) => {
  return (
    <ConfirmModal
      title="Are you sure you want to delete this issue?"
      message="Once you delete, it's gone for good."
      confirmText="Delete issue"
      onConfirm={ async ({ close }) => {
        try {
            const delete_data = {
                _id : card._id as string,
                board_id : card.board_id as string
            }
        await DeleteProject(delete_data)
        } catch (error) {
            console.log('Error in deleting', error)
        } finally{
            close();
        }
      }}
      renderLink={({ openModal }) => (
        <Button onClick={openModal} variant='empty'>
          <Icon type='delete' size={17}/>
        </Button>
      )}
    />
  );
};

export default Delete;