import dbConnect from '@/lib/dbConnect';
import DailyProductionLog from '@/models/DailyProductionLog';
import Employee from '@/models/Employee';
import ProductionStage from '@/models/ProductionStage';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'production_operator', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;

      const matchQuery = {};
      if (startDate) {
        matchQuery.date = { ...matchQuery.date, $gte: new Date(startDate) };
      }
      if (endDate) {
        matchQuery.date = { ...matchQuery.date, $lte: new Date(endDate) };
      }

      const skillBonusReport = await DailyProductionLog.aggregate([
        { $match: matchQuery },
        { $lookup: {
            from: 'employees',
            localField: 'employee',
            foreignField: '_id',
            as: 'employeeDetails'
        }},
        { $unwind: '$employeeDetails' },
        { $lookup: {
            from: 'productionstages',
            localField: 'productionStage',
            foreignField: '_id',
            as: 'stageDetails'
        }},
        { $unwind: '$stageDetails' },
        { $group: {
            _id: '$employee',
            employeeName: { $first: '$employeeDetails.name' },
            totalCostOfWork: { $sum: { $multiply: ['$unitsCompleted', '$stageDetails.costPerUnit'] } },
            details: { $push: {
                date: '$date',
                processingProduct: '$processingProduct',
                productionStage: '$stageDetails.name',
                unitsCompleted: '$unitsCompleted',
                costPerUnit: '$stageDetails.costPerUnit',
                stageCost: { $multiply: ['$unitsCompleted', '$stageDetails.costPerUnit'] }
            }}
        }},
        { $project: {
            _id: 0,
            employeeId: '$_id',
            employeeName: 1,
            totalCostOfWork: 1,
            details: 1
        }}
      ]);

      return res.status(200).json(skillBonusReport);
    } catch (error) {
      console.error('Error generating skill bonus report:', error);
      return res.status(500).json({ error: 'Failed to generate skill bonus report', details: error.message });
    }
  }

  res.status(405).end();
}
