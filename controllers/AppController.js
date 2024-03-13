import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static async getStats(req, res) {
    const userCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();
    res.send({ users: userCount, files: filesCount });
  }

  static getStatus(req, res) {
    const dbStatus = dbClient.isAlive();
    const redisStatus = redisClient.isAlive();
    res.send({ redis: redisStatus, db: dbStatus });
  }
}

export default AppController;
