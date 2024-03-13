import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: `Missing ${email ? 'password' : 'email'}` });
    if (await dbClient.isUser(email)) return res.status(400).json({ error: 'Already exist' });
    const user = await dbClient.addUser(email, password);
    const id = `${user.insertedId}`;
    return res.status(201).json({ id, email });
  }

  static async getUser(req, res) {
    console.log(req.headers);
    const { 'x-token': token } = req.headers;
    console.log(token);
    const id = await redisClient.get(`auth_${token}`);
    console.log(id);
    if (!id) res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.getUserById(id);
    if (!user) res.status(401).json({ error: 'Unauthorized' });
    const { email } = user;
    res.send({ id, email });
  }
}

export default UsersController;
