import type { Channel } from 'stream-chat';

export const getError = (err: any) => {
  const errors = err.errors as { longMessage: string }[];
  const errorMessage = errors
    .map((error, index) => `${index + 1}. ${error.longMessage}`)
    .join('\n');
  alert(errorMessage);
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
