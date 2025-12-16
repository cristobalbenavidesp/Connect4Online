import { redisClient } from "./redis.service.js";
import { Game } from "../models/Game.js";

const GAME_TTL = 3600; // 1 hour

export class GameService {
  /**
   * Serializes and saves the game state to Redis.
   */
  static async saveGame(game: Game): Promise<void> {
    await redisClient.setex(`game:${game.id}`, GAME_TTL, JSON.stringify(game));
  }

  /**
   * Retrieves the game state from Redis and reconstructs the Game object.
   */
  static async getGame(gameId: string): Promise<Game | null> {
    const data = await redisClient.get(`game:${gameId}`);
  if (!data) return null;

  const plainGame = JSON.parse(data);

  // Correct reconstruction
  const game = Object.assign(Object.create(Game.prototype), plainGame);

  return game;
  }

  static async deleteGame(gameId: string): Promise<void> {
    await redisClient.del(`game:${gameId}`);
  }
}

export async function isUserInGame(userId: string) {
  const gameIds = await redisClient.smembers(`user:${userId}:games`);
  return gameIds.length > 0;
}