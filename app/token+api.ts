import { StreamChat } from 'stream-chat';

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY!;
const SECRET = process.env.STREAM_API_SECRET!;

export async function POST(request: Request) {
  const client = StreamChat.getInstance(API_KEY, SECRET);

  const body = await request.json();

  const userId = body?.userId;

  if (!userId) {
    return Response.error();
  }

  const token = client.createToken(userId);

  const response = {
    userId: userId,
    token: token,
  };

  return Response.json(response);
}
