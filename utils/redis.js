import { createClient } from 'async-redis';
// import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log(err));
    this.connected = false;
    this.client.on('connect', () => {
      console.log('redis connected');
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const val = await this.client.get(key);
    return val;
  }

  async set(key, val, dur) {
    const setRet = await this.client.set(key, val, 'EX', dur);
    return setRet;
  }

  async del(key) {
    await this.client.del(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
