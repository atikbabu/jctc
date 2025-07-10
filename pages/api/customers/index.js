// /pages/api/customers/index.js
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return res.status(200).json(customers);
  }

  if (req.method === 'POST') {
    try {
      const customer = await Customer.create(req.body);
      return res.status(201).json(customer);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

