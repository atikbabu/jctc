// /pages/api/customers/[id].js
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      return res.status(200).json(customer);
    }

    if (req.method === 'PUT') {
      const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(customer);
    }

    if (req.method === 'DELETE') {
      await Customer.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Customer API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
