'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface JobPostContextType {
  isJobPostOpen: boolean;
  setJobPostOpen: (open: boolean) => void;
}

const JobPostContext = createContext<JobPostContextType | undefined>(undefined);

export const JobPostProvider = ({ children }: { children: ReactNode }) => {
  const [isJobPostOpen, setJobPostOpen] = useState(false);

  return (
    <JobPostContext.Provider value={{ isJobPostOpen, setJobPostOpen }}>
      {children}
    </JobPostContext.Provider>
  );
};

export const useJobPost = () => {
  const context = useContext(JobPostContext);
  if (context === undefined) {
    throw new Error('useJobPost must be used within a JobPostProvider');
  }
  return context;
};
