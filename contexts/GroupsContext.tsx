import React, { createContext, useContext, useState, ReactNode } from "react";

interface Group {
  id: string;
  name: string;
  type: string;
  password?: string | null;
  avatar: string;
  members: number;
  lastMessage: string;
  time: string;
  online: boolean;
  unread: number;
}

interface GroupsContextType {
  groups: Group[];
  addGroup: (group: Group) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

const SAMPLE_GROUPS: Group[] = [
  {
    id: "group-sample-1",
    name: "Team Brainstorm",
    type: "Public",
    avatar: "https://i.pravatar.cc/150?img=60",
    members: 12,
    lastMessage: "Let's meet tomorrow at 2 PM",
    time: "10:30 am",
    online: true,
    unread: 3,
  },
  {
    id: "group-sample-2",
    name: "Design Team",
    type: "Private",
    avatar: "https://i.pravatar.cc/150?img=61",
    members: 8,
    lastMessage: "New mockups are ready",
    time: "Yesterday",
    online: false,
    unread: 0,
  },
  {
    id: "group-sample-3",
    name: "Project Alpha",
    type: "Password",
    password: "1234",
    avatar: "https://i.pravatar.cc/150?img=62",
    members: 15,
    lastMessage: "Sprint planning meeting",
    time: "Monday",
    online: true,
    unread: 0,
  },
];

export function GroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>(SAMPLE_GROUPS);

  const addGroup = (group: Group) => {
    setGroups((prev) => [group, ...prev]);
  };

  return (
    <GroupsContext.Provider value={{ groups, addGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupsProvider");
  }
  return context;
}
