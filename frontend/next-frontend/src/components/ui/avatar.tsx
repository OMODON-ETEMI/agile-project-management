import React from 'react';
import { User } from '@/src/helpers/type';
import { CircleUserRound, User2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarProps {
  user: User | User[];
  className?: string;
  maxShown? : number;
}



const AvatarComponent: React.FC<AvatarProps> = ({user, className, maxShown}: AvatarProps) => {
  if(!user){
    return(
       <CircleUserRound size={20}/> 
    )
  }
  if(Array.isArray(user)) {
    if(!maxShown) return maxShown = 5
    const visibleUsers = user.slice(0, maxShown);
    const remainingCount = Math.max(user.length - maxShown , 0);
  
    return (
      <div className="flex items-center">
        <div className="flex -space-x-2 overflow-hidden">
          {visibleUsers.map((user, index) => (
            <div
              key={user.user_id || index}
              className={`relative inline-block rounded-full ring-2 ring-white hover:-translate-y-1 transition-transform duration-200 ${className}`}
            >
              {user.image ? (
                <img
                  src={user.image.imageFullUrl}
                  alt={user.image.imageUserName}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-medium">
                    {user.first_name[0].toUpperCase()}{user.last_name[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div
            className={`flex items-center justify-center bg-gray-100 text-gray-600 rounded-full ring-2 ring-white -ml-2 ${className}`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <>
    <Avatar className={`h-6 w-6 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-slate-200 ${className}`}>
      <AvatarImage src={user.image.imageFullUrl} alt={`${user.image.imageUserName} ${user.image.user}`} />
      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">
        {user.first_name[0].toUpperCase()}{user.last_name[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  </> 
  )
};

export default AvatarComponent;
