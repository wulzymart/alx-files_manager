import { v4 } from 'uuid';
import { writeFile } from 'fs/promises';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileTypes = ['folder', 'file', 'image'];
const PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
class FilesController {
  static async postUpload(req, res) {
    const { 'x-token': token } = req.headers;
    const id = await redisClient.get(`auth_${token}`);
    if (!id) res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.getUserById(id);
    if (!user) res.status(401).json({ error: 'Unauthorized' });
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !fileTypes.includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    if (parentId) {
      const parent = await dbClient.getFileById(parentId);
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') res.status(400).json({ error: 'Parent is not a folder' });
    }
    const newFile = {
      userId: id,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };
    if (type !== 'folder') {
      const fileId = v4();
      const localPath = `${PATH}/${fileId}`;
      newFile.localPath = localPath;
      await writeFile(localPath, Buffer.from(data, 'base64'));
    }

    const file = await dbClient.addFile(newFile);
    newFile.id = file.insertedId;
    return res.status(201).json({ file: newFile });
  }
}

export default FilesController;
