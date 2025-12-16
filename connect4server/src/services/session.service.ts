import { redisClient } from './redis.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface UserSession {
  userId: string;
  username: string;
  sockets: string[];
}

const SESSION_TTL = 60 * 60; // 1 hour in seconds

export class SessionService {
  
  static async createSession(username: string, socketId: string) {
    const userId = uuidv4();
    const token = uuidv4();

    const session: UserSession = {
      userId,
      username,
      sockets: [socketId],
    };

    await redisClient.setex(`session:${token}`, SESSION_TTL, JSON.stringify(session));
    await redisClient.setex(`user:${userId}`, SESSION_TTL, token);

    return { token, session };
  }

  static async getSession(token: string): Promise<UserSession | null> {
    const data = await redisClient.get(`session:${token}`);
    if (!data) return null;
    return JSON.parse(data) as UserSession;
  }

  static async refreshSession(token: string): Promise<boolean> {
    const session = await this.getSession(token);
    if (!session) return false;

    await redisClient.expire(`session:${token}`, SESSION_TTL);
    await redisClient.expire(`user:${session.userId}`, SESSION_TTL);

    return true;
  }

  static async deleteSession(token: string) {
    const session = await this.getSession(token);
    if (session) {
      await redisClient.del(`user:${session.userId}`);
    }
    await redisClient.del(`session:${token}`);
  }
}

export async function getUserById(userId: string): Promise<UserSession | null> {
  const token = await redisClient.get(`user:${userId}`);

  if (!token) return null;

  const session = await SessionService.getSession(token);
  
  return session;
}
