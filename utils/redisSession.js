import redisClient from "../config/redis.js";

class RedisSession {
  static async setSession(userId, sessionData, expiryTime = 86400) {
    // 24 hours default
    try {
      const key = `session:${userId}`;
      await redisClient.setEx(key, expiryTime, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error("Redis Session Set Error:", error);
      return false;
    }
  }

  static async getSession(userId) {
    try {
      const key = `session:${userId}`;
      const session = await redisClient.get(key);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error("Redis Session Get Error:", error);
      return null;
    }
  }
  static async deleteSession(userId) {
    try {
      const key = `session:${userId}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Redis Session Delete Error:", error);
      return false;
    }
  }
  static async updateSessionExpiry(userId, expiryTime = 86400) {
    try {
      const key = `session:${userId}`;
      await redisClient.expire(key, expiryTime);
      return true;
    } catch (error) {
      console.error("Redis Session Expiry Update Error:", error);
      return false;
    }
  }
}

export default RedisSession;
