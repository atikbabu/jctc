import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
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
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(400).json({ error: 'Category update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Category.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Category deletion failed' });
    }
  }

  res.status(405).end();
}
