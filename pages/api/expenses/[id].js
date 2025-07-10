import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'cashier'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const expense = await Expense.findById(id).populate('recordedBy', 'name');
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      return res.status(200).json(expense);
    } catch (error) {
      console.error('Error fetching expense:', error);
      return res.status(500).json({ error: 'Failed to fetch expense' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const expense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      return res.status(200).json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      return res.status(400).json({ error: 'Expense update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Expense.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting expense:', error);
      return res.status(500).json({ error: 'Expense deletion failed' });
    }
  }

  res.status(405).end();
}
