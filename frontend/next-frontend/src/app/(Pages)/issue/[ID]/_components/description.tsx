"use client"

import React, { useState } from 'react';
import { Project, User } from '@/src/helpers/type';
import { UpdateProjects } from '@/src/helpers/getData';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';

// Dynamically loading react-quill since it doesn't support SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css'; 

interface ProjectDescriptionProps {
  card: Project;
  currentUser: User;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ card, currentUser }) => {
  const [description, setDescription] = useState(card.description || '');
  const [isEditing, setEditing] = useState(false);

  const handleUpdate = async () => {
    if (!description || description === card.description) {
      setEditing(false);
      return;
    }
    const update = {
      description,
      ID: card._id as string,
      user_id: currentUser.user_id
    };
    try {
      await UpdateProjects(update);
      setEditing(false);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  return (
    <div>
      <h3 className="py-5 text-15 font-medium">Description</h3>
      {isEditing ? (
        <>
          <ReactQuill
            placeholder="Description..."
            value={description}
            onChange={setDescription}
            theme="snow"
            className="mt-2 w-full" 
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],                    // blockquote and code block
                [{ 'header': 1 }, { 'header': 2 }],              // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],    // lists
                [{ 'script': 'sub' }, { 'script': 'super' }],    // superscript/subscript
                [{ 'indent': '-1' }, { 'indent': '+1' }],        // outdent/indent
                [{ 'direction': 'rtl' }],                        // text direction
                [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
                [{ 'color': [] }, { 'background': [] }],         // dropdown with defaults
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']                                        // remove formatting
              ]
            }}
          />
          <div className="flex pt-3">
            <Button variant="primary" onClick={handleUpdate} className="mr-1.5">
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div 
          className="ml-[-7px] p-1.5 rounded text-gray-700 text-15 cursor-pointer transition-colors duration-100 hover:bg-gray-100"
          onClick={() => setEditing(true)}
          dangerouslySetInnerHTML={{ __html: description || 'Add a description...' }}
        />
      )}
    </div>
  );
};

export default ProjectDescription;