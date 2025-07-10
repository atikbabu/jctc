import dbConnect from '@/lib/dbConnect';
import DailyAttendance from '@/models/DailyAttendance';
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
      const logs = await DailyAttendance.find({})
        .populate('employee')
        .sort({ date: -1 });
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch daily attendance logs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { employee, date, checkInTime, checkOutTime } = req.body;

      // Calculate overtime hours
      const officeEndTime = 19; // 7 PM
      const checkOutHour = parseInt(checkOutTime.split(':')[0]);
      let overtimeHours = 0;

      if (checkOutHour > officeEndTime) {
        overtimeHours = checkOutHour - officeEndTime;
        // Consider minutes if necessary, but for now, just whole hours
      }

      const log = await DailyAttendance.create({
        employee,
        date,
        checkInTime,
        checkOutTime,
        overtimeHours,
      });
      return res.status(201).json(log);
    } catch (error) {
      return res.status(400).json({ error: 'Daily attendance log creation failed' });
    }
  }

  res.status(405).end();
}
