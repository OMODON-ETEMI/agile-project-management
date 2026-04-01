"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, FileQuestion, ShieldOff, Users } from 'lucide-react';
import Button from './button';
import Image from 'next/image';

type ErrorType = 'notFound' | 'unauthorized' | 'noData' | 'insufficientRole';

interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  actionLabel?: string;
  actionRoute?: string;
  userRole?: string;
}

const errorConfig = {
  notFound: {
    icon: FileQuestion,
    title: "Page Not Found",
    message: "Looks like this task got lost in the workflow! Let's get you back on track.",
    actionLabel: "Back to organisation",
    actionRoute: "/organisation",
    color: "text-orange-500",
    illustration: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "404 Task Management Illustration"
  },
  unauthorized: {
    icon: Lock,
    title: "Access Restricted",
    message: "This workspace is locked. Please sign in or request access from your project manager.",
    actionLabel: "Sign In",
    actionRoute: "/user/signup",
    color: "text-red-500",
    illustration: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Unauthorized Access Illustration"
  },
  insufficientRole: {
    icon: ShieldOff,
    title: "Access Level Required",
    message: "Your current role (Viewer) doesn't have permission to access this feature. Please contact your workspace admin for elevated access.",
    actionLabel: "Back to Safety",
    actionRoute: "/dashboard",
    color: "text-purple-500",
    illustration: "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Insufficient Role Access Illustration"
  },
  noData: {
    icon: AlertTriangle,
    title: "No Tasks Found",
    message: "Your task board is empty. Time to start planning your next big project!",
    actionLabel: "Create New Task",
    actionRoute: "/",
    color: "text-yellow-500",
    illustration: "/illustrations/empty-tasks.svg",
    imageAlt: "Empty Task Board Illustration"
  }
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  type = 'notFound',
  title,
  message,
  actionLabel,
  actionRoute,
  userRole
}) => {
  const router = useRouter();
  const config = errorConfig[type];
  const IconComponent = config.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16"
      >
        {/* Left Content Section */}
        <motion.div 
          variants={itemVariants}
          className="w-full lg:w-1/2 max-w-md text-center lg:text-left order-2 lg:order-1"
        >
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg">
            <IconComponent className={`w-8 h-8 ${config.color}`} />
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title || config.title}
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            {message || config.message}
          </p>

          {type === 'insufficientRole' && userRole && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Your current role: <span className="font-semibold">{userRole}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              onClick={() => router.push(actionRoute || config.actionRoute)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 
                text-white rounded-lg text-base font-medium transition-colors"
            >
              {actionLabel || config.actionLabel}
            </Button>
            
            {type === 'unauthorized' && (
              <Button
                variant="empty"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 
                  text-gray-700 rounded-lg text-base font-medium transition-colors"
              >
                Go Back
              </Button>
            )}
          </div>
        </motion.div>

        {/* Right Illustration Section */}
        <motion.div 
          variants={itemVariants}
          className="w-full lg:w-1/2 max-w-lg relative order-1 lg:order-2"
        >
          <div className="relative w-full h-64 lg:h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={config.illustration}
                  alt={config.imageAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <motion.div 
            className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full opacity-50"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
};

// Export named components for specific error types
export const NotFoundError = ({ 
  message, 
  actionLabel, 
  actionRoute 
}: { 
  message?: string; 
  actionLabel?: string; 
  actionRoute?: string; 
}) => (
  <ErrorPage type="notFound" message={message} actionLabel={actionLabel} actionRoute={actionRoute} />
);

export const UnauthorizedError = ({ 
  message = "You need to be logged in to access this.", 
  actionLabel = "Login", 
  actionRoute = "/login" 
}: { 
  message?: string; 
  actionLabel?: string; 
  actionRoute?: string; 
}) => (
  <ErrorPage 
    type="unauthorized" 
    message={message} 
    actionLabel={actionLabel} 
    actionRoute={actionRoute} 
  />
);


export const InsufficientRoleError = ({ 
  userRole 
}: { 
  userRole: string 
}) => (
  <ErrorPage 
    type="insufficientRole" 
    userRole={userRole} 
    message={`Your current role (${userRole}) does not have permission to view this page.`}
  />
);

export const NoDataError = ({ 
  message = "No records found.", 
  actionLabel, 
  actionRoute 
}: { 
  message?: string; 
  actionLabel?: string; 
  actionRoute?: string; 
}) => (
  <ErrorPage 
    type="noData" 
    message={message} 
    actionLabel={actionLabel} 
    actionRoute={actionRoute} 
  />
);

export default ErrorPage;