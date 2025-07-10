import dbConnect from '@/lib/dbConnect';
import Material from '@/models/Material';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const material = await Material.findById(id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      return res.status(200).json(material);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch material' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const material = await Material.findByIdAndUpdate(id, req.body, { new: true });
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      return res.status(200).json(material);
    } catch (error) {
      return res.status(400).json({ error: 'Material update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Material.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Material deletion failed' });
    }
  }

  res.status(405).end();
}
