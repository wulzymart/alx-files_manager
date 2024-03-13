import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { validatePassword } from '../utils/utils';

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Basic ')) res.status(401).json({ error: 'Unauthorized' });
    const base64tkn = authorization.split(' ')[1];
    if (!base64tkn) res.status(401).json({ error: 'Unauthorized' });
    const decodedToken = Buffer.from(base64tkn, 'base64').toString('utf8');
    if (!decodedToken.includes(':')) return res.status(401).json({ error: 'Unauthorized' });
    const [email, password] = decodedToken.split(':', 2);
    const user = await dbClient.getUserByEmail(email);
    if (!user || !validatePassword(password, user.password)) return res.status(401).json({ error: 'Unauthorized' });
    const token = v4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
    return res.send({ token });
  }

  static async getDisconnect(req, res) {
    const { 'x-token': token } = req.headers;
    const id = await redisClient.get(`auth_${token}`);
    if (!id) res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.getUserById(id);
    if (!user) res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);
    res.status(204);
    return res.end();
  }
}

export default AuthController;
