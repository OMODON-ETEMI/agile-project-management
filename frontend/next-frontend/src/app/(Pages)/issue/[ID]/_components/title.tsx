"use client"

import React, { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Issue, Project, User } from '@/src/helpers/type';
import { UpdateProjects } from '@/src/helpers/getData';

interface ProjectTitleProps {
  card: Project | Issue;
  currentUser: User;
}

const ProjectTitle: React.FC<ProjectTitleProps> = ({ card, currentUser }) => {
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);

  const validateTitle = (title: string): string | null => {
    if (!title.trim()) {
      return "Title is required";
    }
    if (title.length > 200) {
      return "Title must be 200 characters or less";
    }
    return null;
  };

  const handleTitleChange = async () => {
    setError(null);

    const title = titleInputRef.current?.value;
    if (!title || title === card.name) return;

    const validationError = validateTitle(title);

    if (validationError) {
      setError(validationError);
    } else {
      const update = {
        name: title,
        ID: card._id as string,
        user_id: currentUser.user_id,
      };
      try {
        await UpdateProjects(update);
      } catch (error) {
        setError("Failed to update project title");
      }
    }
  };

  return (
    <>
      <TextareaAutosize
        minRows={1}
        placeholder="Short summary"
        defaultValue={card.name}
        ref={titleInputRef}
        onBlur={handleTitleChange}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleTitleChange();
          }
        }}
        className="mt-[18px] -ml-2 h-11 w-full px-[7px] py-[7px] leading-tight border-none resize-none bg-white transition-colors duration-100 text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 focus:hover:bg-white"
      />
      {error && (
        <div className="pt-1 text-red-500 text-sm font-medium">
          {error}
        </div>
      )}
    </>
  );
};

export default ProjectTitle;