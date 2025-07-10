import dbConnect from '@/lib/dbConnect';
import SubCategory from '@/models/SubCategory';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const subCategory = await SubCategory.findById(id).populate('category');
      if (!subCategory) {
        return res.status(404).json({ error: 'SubCategory not found' });
      }
      return res.status(200).json(subCategory);
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      return res.status(500).json({ error: 'Failed to fetch subcategory' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const subCategory = await SubCategory.findByIdAndUpdate(id, req.body, { new: true });
      if (!subCategory) {
        return res.status(404).json({ error: 'SubCategory not found' });
      }
      return res.status(200).json(subCategory);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      return res.status(400).json({ error: 'SubCategory update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await SubCategory.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      return res.status(500).json({ error: 'SubCategory deletion failed' });
    }
  }

  res.status(405).end();
}
