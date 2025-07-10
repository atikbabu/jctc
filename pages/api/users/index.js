// /pages/api/users/index.js
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

  if (req.method === 'GET') {
    const users = await User.find({}, '-password');
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    try {
      const { name, username, password, role } = req.body;
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already exists' });

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, username, password: hash, role });
      return res.status(201).json({ message: 'User created', user });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

