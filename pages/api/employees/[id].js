import dbConnect from '@/lib/dbConnect';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch employee' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { imageUrl, ...rest } = req.body;
      const employee = await Employee.findByIdAndUpdate(id, { ...rest, imageUrl }, { new: true });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      return res.status(200).json(employee);
    } catch (error) {
      return res.status(400).json({ error: 'Employee update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Employee.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Employee deletion failed' });
    }
  }

  res.status(405).end();
}
