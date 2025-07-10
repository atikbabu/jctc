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

  if (req.method === 'GET') {
    try {
      const employees = await Employee.find({});
      return res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { imageUrl, ...rest } = req.body;
      const employee = await Employee.create({ ...rest, imageUrl });
      return res.status(201).json(employee);
    } catch (error) {
      return res.status(400).json({ error: 'Employee creation failed' });
    }
  }

  res.status(405).end();
}
