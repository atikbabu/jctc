import dbConnect from '@/lib/dbConnect';
import Expense from '@/models/Expense';
import Sale from '@/models/Sale';
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
      const { startDate, endDate } = req.query;
      let dateQuery = {};

      if (startDate && endDate) {
        dateQuery = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Fetch total expenses
      const totalExpensesResult = await Expense.aggregate([
        { $match: { date: dateQuery } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const totalExpenses = totalExpensesResult[0]?.total || 0;

      // Fetch total sales
      const totalSalesResult = await Sale.aggregate([
        { $match: { createdAt: dateQuery } }, // Assuming sales use createdAt for date
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);
      const totalSales = totalSalesResult[0]?.total || 0;

      res.status(200).json({ totalExpenses, totalSales });
    } catch (error) {
      console.error('Error fetching expense vs sell report:', error);
      res.status(500).json({ error: 'Failed to fetch expense vs sell report' });
    }
  } else {
    res.status(405).end();
  }
}
