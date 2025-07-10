import dbConnect from '@/lib/dbConnect';
import DailyAttendance from '@/models/DailyAttendance';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const log = await DailyAttendance.findById(id).populate('employee');
      if (!log) {
        return res.status(404).json({ error: 'Daily attendance log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch daily attendance log' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { checkInTime, checkOutTime } = req.body;

      // Recalculate overtime hours on update
      const officeEndTime = 19; // 7 PM
      const checkOutHour = parseInt(checkOutTime.split(':')[0]);
      let overtimeHours = 0;

      if (checkOutHour > officeEndTime) {
        overtimeHours = checkOutHour - officeEndTime;
      }

      const log = await DailyAttendance.findByIdAndUpdate(
        id,
        { ...req.body, overtimeHours },
        { new: true }
      );
      if (!log) {
        return res.status(404).json({ error: 'Daily attendance log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(400).json({ error: 'Daily attendance log update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await DailyAttendance.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Daily attendance log deletion failed' });
    }
  }

  res.status(405).end();
}
