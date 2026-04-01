import React from "react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="px-3 pt-2 text-xs font-medium text-gray-600">
      {items.map((item, index) => (
        <span key={index}>
          {item.href ? (
            <a href={item.href} className="hover:underline cursor-pointer">
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
