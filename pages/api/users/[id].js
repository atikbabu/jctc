// /pages/api/users/[id].js
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, username, password, role } = req.body;
    const update = { name, username, role };
    if (password) update.password = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await User.findByIdAndDelete(id);
    return res.status(204).end();
  }

  res.status(405).end();
}

