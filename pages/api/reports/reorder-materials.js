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
    try {
      const reorderMaterials = await Material.find({
        $expr: { $lt: ["$quantity", "$reorderLevel"] } // Corrected comparison using $expr
      });
      return res.status(200).json(reorderMaterials);
    } catch (error) {
      console.error('Error fetching reorder materials:', error);
      return res.status(500).json({ error: 'Failed to fetch reorder materials', details: error.message });
    }
  }

  res.status(405).end();
}
