import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export interface Poll {
  id: string;
  question: string;
  options: string[];
  allowMultiple: boolean;
  votes: { [optionIndex: number]: string[] }; // optionIndex -> array of user IDs
  createdBy: string;
  createdAt: string;
}

interface PollContextType {
  addPollToChat: (chatId: string, poll: Poll) => void;
  getPendingPoll: (chatId: string) => Poll | null;
  clearPendingPoll: (chatId: string) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export function PollProvider({ children }: { children: ReactNode }) {
  const [pendingPolls, setPendingPolls] = useState<{ [chatId: string]: Poll }>(
    {}
  );

  const addPollToChat = useCallback((chatId: string, poll: Poll) => {
    setPendingPolls((prev) => ({
      ...prev,
      [chatId]: poll,
    }));
  }, []);

  const getPendingPoll = useCallback(
    (chatId: string) => {
      return pendingPolls[chatId] || null;
    },
    [pendingPolls]
  );

  const clearPendingPoll = useCallback((chatId: string) => {
    setPendingPolls((prev) => {
      const newPolls = { ...prev };
      delete newPolls[chatId];
      return newPolls;
    });
  }, []);

  const value = useMemo(
    () => ({ addPollToChat, getPendingPoll, clearPendingPoll }),
    [addPollToChat, getPendingPoll, clearPendingPoll]
  );

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

export function usePolls() {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePolls must be used within a PollProvider");
  }
  return context;
}
