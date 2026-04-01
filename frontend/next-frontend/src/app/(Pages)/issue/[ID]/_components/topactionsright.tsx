import React from 'react';

// The TopActionsRight component with Tailwind styling applied
const TopActionsRight: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center">
      {React.Children.map(children, (child, index) =>
        child ? (
          <div className={index !== 0 ? 'ml-1' : ''}>{child}</div>
        ) : null
      )}
    </div>
  );
};



export default TopActionsRight;
