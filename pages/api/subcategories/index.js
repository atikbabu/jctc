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

  if (req.method === 'GET') {
    try {
      const subCategories = await SubCategory.find({});
      return res.status(200).json(subCategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
  }

  if (req.method === 'POST') {
    try {
      const subCategory = await SubCategory.create(req.body);
      return res.status(201).json(subCategory);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      return res.status(400).json({ error: 'SubCategory creation failed' });
    }
  }

  res.status(405).end();
}
