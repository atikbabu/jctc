import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'cashier'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const expenses = await Expense.find({}).populate('recordedBy', 'name');
      return res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, amount, category, description } = req.body;
      const expense = await Expense.create({
        date,
        amount,
        category,
        description,
        recordedBy: new mongoose.Types.ObjectId(session.user.id),
      });
      return res.status(201).json(expense);
    } catch (error) {
      console.error('Error creating expense:', error);
      return res.status(400).json({ error: 'Expense creation failed' });
    }
  }

  res.status(405).end();
}
