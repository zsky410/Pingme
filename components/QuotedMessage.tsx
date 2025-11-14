import { StyleSheet, Text, View } from 'react-native';
import { useMessageContext } from 'stream-chat-expo';

import Avatar from './Avatar';

const QuotedMessage = () => {
  const { message, alignment } = useMessageContext();

  const quotedMessage = message?.quoted_message;
  if (!quotedMessage) return null;

  const isMyMessage = alignment === 'right';
  const borderColor = isMyMessage ? '#175dee' : '#e9e9e9';
  const backgroundColor = isMyMessage
    ? 'rgba(255, 255, 255, 0.2)'
    : 'rgba(0, 0, 0, 0.05)';
  const textColor = isMyMessage
    ? 'rgba(255, 255, 255, 0.9)'
    : '#666';
  const nameColor = isMyMessage
    ? 'rgba(255, 255, 255, 0.9)'
    : '#666';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Avatar
            size={16}
            name={quotedMessage.user?.name || ''}
            fontSize={8}
            imageUrl={quotedMessage.user?.image}
            placeholderType="text"
          />
          <Text style={[styles.name, { color: nameColor }]}>
            {quotedMessage.user?.name || 'Unknown'}
          </Text>
        </View>
        <Text style={[styles.text, { color: textColor }]} numberOfLines={2}>
          {quotedMessage.text || 'Photo'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftBorder: {
    width: 3,
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 6,
    paddingRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  text: {
    fontSize: 13,
    color: '#333',
    lineHeight: 16,
  },
});

export default QuotedMessage;

