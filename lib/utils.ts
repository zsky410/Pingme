import type { Channel } from 'stream-chat';

export const getLastSeen = (lastActive: string) => {
  if (!lastActive) {
    return 'last seen a long time ago';
  }
  const lastActiveDate = new Date(lastActive);
  const currentDate = new Date();
  const diff = currentDate.getTime() - lastActiveDate.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 1) {
    return 'last seen recently';
  } else if (days < 7) {
    return 'last seen within a week';
  } else if (days < 30) {
    return 'last seen within a month';
  } else {
    return 'last seen a long time ago';
  }
};

export const checkIfDMChannel = (channel: Channel) => {
  return !!channel?.id?.startsWith('!members');
};

export const getDMUser = (channel: Channel, userId: string) => {
  const members = { ...channel.state.members };
  delete members[userId];
  return Object.values(members)[0].user!;
};

export const getChannelName = (channel: Channel, userId: string) => {
  if (checkIfDMChannel(channel)) {
    const member = getDMUser(channel, userId)!;
    // @ts-expect-error - channel?.data?.name can be undefined
    return member.name || `${member.first_name} ${member.last_name}`;
  } else {
    // @ts-expect-error - channel?.data?.name can be undefined
    return channel?.data?.name as string;
  }
};
