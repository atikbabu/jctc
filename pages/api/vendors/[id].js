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
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      return res.status(200).json(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const vendor = await Vendor.findByIdAndUpdate(id, req.body, { new: true });
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      return res.status(200).json(vendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
      return res.status(400).json({ error: 'Vendor update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Vendor.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      return res.status(500).json({ error: 'Vendor deletion failed' });
    }
  }

  res.status(405).end();
}
