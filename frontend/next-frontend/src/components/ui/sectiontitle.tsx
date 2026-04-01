import React, { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => {
    return (
      <div className="mt-6 mb-1.5 text-xs font-bold uppercase text-gray-600">
        {children}
      </div>
    );
  };
  
  export default SectionTitle;