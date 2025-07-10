import dbConnect from '@/lib/dbConnect';
import Vendor from '@/models/Vendor';
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
      const vendors = await Vendor.find({});
      return res.status(200).json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  }

  if (req.method === 'POST') {
    try {
      const vendor = await Vendor.create(req.body);
      return res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      return res.status(400).json({ error: 'Vendor creation failed' });
    }
  }

  res.status(405).end();
}
