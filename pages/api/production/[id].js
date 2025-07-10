
import dbConnect from '../../../lib/dbConnect';
import Production from '../../../models/Production';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const production = await Production.findById(id).populate('rawMaterials.materialId');
        if (!production) {
          return res.status(404).json({ success: false, error: 'Production not found' });
        }
        res.status(200).json({ success: true, data: production });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const { productName, rawMaterials, laborCostPerUnit, overheadCostPerUnit } = req.body;
        const updatedProduction = await Production.findByIdAndUpdate(
          id,
          { productName, rawMaterials, laborCostPerUnit, overheadCostPerUnit },
          { new: true, runValidators: true }
        );
        if (!updatedProduction) {
          return res.status(404).json({ success: false, error: 'Production not found' });
        }
        res.status(200).json({ success: true, data: updatedProduction });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedProduction = await Production.deleteOne({ _id: id });
        if (!deletedProduction) {
          return res.status(404).json({ success: false, error: 'Production not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      break;
  }
}
