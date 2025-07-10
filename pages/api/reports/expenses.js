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

  if (req.method === 'GET') {
    try {
      const { startDate, endDate, category } = req.query;
      let query = {};

      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (category) {
        query.category = category;
      }

      const expenses = await Expense.find(query).populate('recordedBy', 'name').sort({ date: -1 });
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      res.status(200).json({ expenses, totalAmount });
    } catch (error) {
      console.error('Error fetching expense report:', error);
      res.status(500).json({ error: 'Failed to fetch expense report' });
    }
  } else {
    res.status(405).end();
  }
}
