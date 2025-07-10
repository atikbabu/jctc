import dbConnect from '@/lib/dbConnect';
import AppConfig from '@/models/AppConfig';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const config = await AppConfig.findOne();
      if (!config) {
        // Create a default configuration if none exists
        const defaultConfig = await AppConfig.create({});
        return res.status(200).json(defaultConfig);
      }
      return res.status(200).json(config);
    } catch (error) {
      console.error('Error fetching app config:', error);
      return res.status(500).json({ error: 'Failed to fetch app config' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { softwareTitle, logoUrl, timezone, displayType } = req.body;
      let config = await AppConfig.findOne();

      if (config) {
        // Update existing config
        config.softwareTitle = softwareTitle;
        config.logoUrl = logoUrl;
        config.timezone = timezone;
        config.displayType = displayType;
        await config.save();
      } else {
        // Create new config if none exists
        config = await AppConfig.create({ softwareTitle, logoUrl, timezone, displayType });
      }
      return res.status(200).json(config);
    } catch (error) {
      console.error('Error updating app config:', error);
      return res.status(500).json({ error: 'Failed to update app config' });
    }
  }

  res.status(405).end();
}
