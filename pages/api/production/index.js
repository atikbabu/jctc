import dbConnect from '@/lib/dbConnect';
import Production from '@/models/Production';
import Material from '@/models/Material';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    const productions = await Production.find().populate('rawMaterials.materialId');
    return res.status(200).json(productions);
  }

  if (req.method === 'POST') {
    try {
      const { productName, rawMaterials, laborCostPerUnit, overheadCostPerUnit } = req.body;

      const production = await Production.create({
        productName,
        rawMaterials,
        laborCostPerUnit,
        overheadCostPerUnit,
      });

      // Decrement material quantities
      for (const rawMaterial of rawMaterials) {
        await Material.findByIdAndUpdate(
          rawMaterial.materialId,
          { $inc: { quantity: -rawMaterial.quantityUsed } },
          { new: true }
        );
      }

      return res.status(201).json(production);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Production failed.' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}
