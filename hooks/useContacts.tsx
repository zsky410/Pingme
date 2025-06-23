import { useEffect, useRef, useState } from 'react';
import { StreamChat, UserResponse } from 'stream-chat';

const useContacts = (
  client: StreamChat,
  setUsers?: (contacts: UserResponse[]) => void,
  fetchContacts: boolean = true
) => {
  const [contacts, setContacts] = useState<UserResponse[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        setLoadingContacts(true);
        const userId = client.userID!;
        const channels = await client.queryChannels({
          type: 'messaging',
          member_count: 2,
          members: { $in: [userId] },
        });

        const dmChannels = channels.filter((channel) =>
          channel.id?.startsWith('!members')
        );

        const contacts = dmChannels
          .map((channel) => {
            const members = Object.values(channel.state.members || {});
            return (
              members.find((m) => m.user_id !== client.userID)?.user || null
            );
          })
          .filter(Boolean) as UserResponse[];

        setContacts(contacts);
        if (setUsers) {
          setUsers(contacts);
        }
      } catch (error: any) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    };
    if (fetchContacts) getAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debounceSearch = (
    text: string,
    reset: () => void,
    filterFn: (query: string) => Promise<void> | void
  ) => {
    const query = text.trimStart();

    if (!query) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      cancelled.current = true;
      reset();
      return;
    }

    cancelled.current = false;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(async () => {
      if (cancelled.current) return;
      await filterFn(query);
    }, 200);
  };

  return {
    contacts,
    loadingContacts,
    debounceSearch,
  };
};

export default useContacts;
