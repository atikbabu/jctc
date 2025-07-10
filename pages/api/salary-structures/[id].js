import dbConnect from '@/lib/dbConnect';
import SalaryStructure from '@/models/SalaryStructure';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const structure = await SalaryStructure.findById(id);
      if (!structure) {
        return res.status(404).json({ error: 'Salary structure not found' });
      }
      return res.status(200).json(structure);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch salary structure' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const structure = await SalaryStructure.findByIdAndUpdate(id, req.body, { new: true });
      if (!structure) {
        return res.status(404).json({ error: 'Salary structure not found' });
      }
      return res.status(200).json(structure);
    } catch (error) {
      return res.status(400).json({ error: 'Salary structure update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await SalaryStructure.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Salary structure deletion failed' });
    }
  }

  res.status(405).end();
}
