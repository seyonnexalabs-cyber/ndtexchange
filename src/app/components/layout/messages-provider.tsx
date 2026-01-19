'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import MessagesSidebar from './messages-sidebar';

interface MessagesContextType {
  setMessagesOpen: (open: boolean) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [isMessagesOpen, setMessagesOpen] = useState(false);

  return (
    <MessagesContext.Provider value={{ setMessagesOpen }}>
      {children}
      <MessagesSidebar isOpen={isMessagesOpen} onOpenChange={setMessagesOpen} />
    </MessagesContext.Provider>
  );
};
