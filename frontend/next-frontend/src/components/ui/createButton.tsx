// components/CreateProjectButton.tsx
import React, { useState } from 'react';
import Button from './button';
import Modal from './modal';
import { useRouter } from 'next/navigation';
import { divide } from 'lodash';
import ProjectCreate from './cretaeProject';

interface CreateProjectButtonProps {
  buttonText?: string;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ buttonText = "Create +"}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const router = useRouter()

  return (
    <>
      <Button 
        onClick={handleOpenModal} 
        variant='primary'
        icon='add'
        >
        {buttonText}
      </Button>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}
        renderContent={modal => (
          <div>
            <ProjectCreate modalClose={modal.close} currentUser={} /> 
          </div>
        )}
        />
      )}
    </>
  );
};

export default CreateProjectButton;
