import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      filename: (name, ext, part) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        return `${uniqueSuffix}${ext}`;
      },
    });

    try {
      const [fields, files] = await form.parse(req);

      const file = files.image && files.image[0];
      if (!file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      console.log('File path from formidable:', file.filepath);
      const relativePath = `/uploads/${path.basename(file.filepath)}`;
      console.log('Generated relativePath:', relativePath);
      return res.status(200).json({ message: 'Image saved successfully', imageUrl: relativePath });
    } catch (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }
  } else {
    res.status(405).end();
  }
}