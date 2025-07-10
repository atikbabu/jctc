import dbConnect from '@/lib/dbConnect';
import SalaryStructure from '@/models/SalaryStructure';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const structures = await SalaryStructure.find({});
      return res.status(200).json(structures);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch salary structures' });
    }
  }

  if (req.method === 'POST') {
    try {
      const structure = await SalaryStructure.create(req.body);
      return res.status(201).json(structure);
    } catch (error) {
      return res.status(400).json({ error: 'Salary structure creation failed' });
    }
  }

  res.status(405).end();
}
