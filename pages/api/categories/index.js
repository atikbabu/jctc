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

  if (req.method === 'GET') {
    try {
      const categories = await Category.find({});
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  if (req.method === 'POST') {
    try {
      const category = await Category.create(req.body);
      return res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(400).json({ error: 'Category creation failed' });
    }
  }

  res.status(405).end();
}
