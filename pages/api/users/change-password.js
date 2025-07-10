import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    await dbConnect();
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(session.user.id); // Assuming session contains user ID

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid current password' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();

      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.status(405).end();
}
