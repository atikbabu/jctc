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

  if (req.method === 'GET') {
    const materials = await Material.find();
    return res.status(200).json(materials);
  }

  if (req.method === 'POST') {
    try {
      const material = await Material.create(req.body);
      return res.status(201).json(material);
    } catch (err) {
      return res.status(400).json({ error: 'Material creation failed' });
    }
  }

  res.status(405).end();
}
