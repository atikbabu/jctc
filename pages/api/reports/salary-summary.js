import dbConnect from '@/lib/dbConnect';
import DailyProductionLog from '@/models/DailyProductionLog';
import Employee from '@/models/Employee';
import FinishedProduct from '@/models/FinishedProduct';
import SalaryStructure from '@/models/SalaryStructure';
import DailyAttendance from '@/models/DailyAttendance';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'hrm_manager'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    const { employeeId, startDate, endDate, skillsBonus = 0 } = req.query;

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Employee ID, start date, and end date are required.' });
    }

    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found.' });
      }

      const salaryStructure = await SalaryStructure.findOne({ rank: employee.rank });
      if (!salaryStructure) {
        return res.status(404).json({ error: `Salary structure not found for rank: ${employee.rank}` });
      }

      // Fetch production logs
      const productionLogs = await DailyProductionLog.find({
        employee: employeeId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      })
        .populate('finishedProduct')
        .sort('date');

      const productSummary = {};
      productionLogs.forEach((log) => {
        const productName = log.finishedProduct.category + ' ' + log.finishedProduct.subCategory;
        const finishedProductId = log.finishedProduct._id.toString();
        const manpowerCharge = log.finishedProduct.manpowerChargePerUnit || 0;
        const logDate = new Date(log.date).getDate(); // Get day of the month

        if (!productSummary[finishedProductId]) {
          productSummary[finishedProductId] = {
            productName: productName,
            totalQuantity: 0,
            manpowerCharge: manpowerCharge,
            totalManpowerCharge: 0,
            dailyQuantities: Array(31).fill(0), // Initialize for 31 days
          };
        }

        productSummary[finishedProductId].totalQuantity += log.quantity;
        productSummary[finishedProductId].totalManpowerCharge += log.quantity * manpowerCharge;
        productSummary[finishedProductId].dailyQuantities[logDate] += log.quantity;
      });

      const grandTotalManpowerCharge = Object.values(productSummary).reduce((sum, prod) => sum + prod.totalManpowerCharge, 0);

      // Fetch attendance logs for overtime calculation
      const attendanceLogs = await DailyAttendance.find({
        employee: employeeId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });

      let totalOvertimeHours = 0;
      attendanceLogs.forEach(log => {
        totalOvertimeHours += log.overtimeHours;
      });

      const overtimePay = totalOvertimeHours * salaryStructure.overtimeAllowancePerHour;

      // Calculate fixed components
      const basicPay = salaryStructure.basicPay;
      const houseRentAllowance = salaryStructure.houseRentAllowance;
      const medicalAllowance = salaryStructure.medicalAllowance;
      const conveyanceAllowance = salaryStructure.conveyanceAllowance;

      // Skills Bonus (from query parameter, capped by maxSkillsBonus)
      const actualSkillsBonus = Math.min(parseFloat(skillsBonus), salaryStructure.maxSkillsBonus);

      const netSalary = basicPay + houseRentAllowance + medicalAllowance + conveyanceAllowance + grandTotalManpowerCharge + overtimePay + actualSkillsBonus;

      const report = {
        employeeName: employee.name,
        employeeId: employee.employeeId,
        employeeRank: employee.rank,
        startDate: startDate,
        endDate: endDate,
        fixedAllowances: {
          basicPay,
          houseRentAllowance,
          medicalAllowance,
          conveyanceAllowance,
        },
        productionEarnings: {
          products: Object.values(productSummary),
          grandTotalManpowerCharge,
        },
        overtime: {
          totalOvertimeHours,
          overtimeAllowancePerHour: salaryStructure.overtimeAllowancePerHour,
          overtimePay,
        },
        skillsBonus: actualSkillsBonus,
        netSalary,
      };

      return res.status(200).json(report);
    } catch (error) {
      console.error('Error generating salary summary:', error);
      return res.status(500).json({ error: 'Failed to generate salary summary' });
    }
  }

  res.status(405).end();
}
