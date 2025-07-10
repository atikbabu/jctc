import dbConnect from '@/lib/dbConnect';
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
      const { year } = req.query;
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

      const totalTurnoverResult = await Sale.aggregate([
        { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);
      const totalTurnover = totalTurnoverResult[0]?.total || 0;

      res.status(200).json({ year, totalTurnover });
    } catch (error) {
      console.error('Error fetching annual turnover report:', error);
      res.status(500).json({ error: 'Failed to fetch annual turnover report' });
    }
  } else {
    res.status(405).end();
  }
}
