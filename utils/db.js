import { MongoClient, ObjectID } from 'mongodb';
import sha1 from 'sha1';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}`;
    this.connected = false;
    this.client = new MongoClient(uri, { useUnifiedTopology: true });
    const connect = async () => {
      this.client.connect().then(() => {
        this.connected = true;
      }).catch((err) => console.log(err.message));
    };
    connect();
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const users = await this.client.db(this.database).collection('users').countDocuments();
    return users;
  }

  async nbFiles() {
    const users = await this.client.db(this.database).collection('files').countDocuments();
    return users;
  }

  async getUserByEmail(email) {
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getUserById(id) {
    const _id = new ObjectID(id);
    const user = await this.client.db(this.database).collection('users').find({ _id }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async isUser(email) {
    const user = await this.getUserByEmail(email);
    console.log(Boolean(user));
    return Boolean(user);
  }

  async addUser(email, password) {
    const hashPassword = sha1(password);
    const user = await this.client.db(this.database).collection('users').insertOne({ email, password: hashPassword });
    return user;
  }

  async addFile(file) {
    const newFile = await this.client.db(this.database).collection('files').insertOne(file);
    return newFile;
  }

  async addFolder(userId, params) {
    const {
      name,
      type,
      parentId,
      isPublic,
    } = params;
    const file = await this.client.db(this.database).collection('files').insertOne({
      userId, name, type, parentId: parentId || 0, isPublic: isPublic || false,
    });
    return file;
  }

  async getFileById(id) {
    const _id = new ObjectID(id);
    const file = await this.client.db(this.database).collection('files').find({ _id }).toArray();
    if (!file.length) {
      return null;
    }
    return file[0];
  }
}

const dbClient = new DBClient();

export default dbClient;
