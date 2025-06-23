import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

const app = express();
const PORT = 5175;
const allowedOrigins = [
  'http://localhost:5173', 
  'https://benasdom.github.io', 
  
];


app.use(
  cors({
    origin: (origin, callback) => {
      
      if (!origin) return callback(null, true);

      
      if (allowedOrigins.some(allowedUrl => origin.startsWith(allowedUrl))) {
        return callback(null, true);
      } else {
        return callback(new Error('Blocked by CORS: Origin not allowed'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
  })
);

async function getAllFilesWithLinks() {
  try {
    const res = await drive.files.list({
      q: "trashed = false",
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
      pageSize: 1000,
    });

    return res.data.files.map(file => ({
      ...file,
      fileType: file.mimeType.split('/')[1] || 'file',
      directDownload: `https://drive.google.com/uc?export=download&id=${file.id}`,
      previewLink: `https://drive.google.com/file/d/${file.id}/preview`,
      viewLink: `https://drive.google.com/file/d/${file.id}/view`
    }));
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

async function getFileByName(filename) {
  try {
    const res = await drive.files.list({
      q: `name = '${filename}' and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
      pageSize: 10,
    });

    if (!res.data.files || res.data.files.length === 0) {
      throw new Error('File not found');
    }

    const file = res.data.files[0];
    return {
      ...file,
      fileType: file.mimeType.split('/')[1] || 'file',
      directDownload: `https://drive.google.com/uc?export=download&id=${file.id}`,
      previewLink: `https://drive.google.com/file/d/${file.id}/preview`,
      viewLink: `https://drive.google.com/file/d/${file.id}/view`
    };
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

app.get('/api/files', async (req, res) => {
  try {
    const files = await getAllFilesWithLinks();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.get('/api/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const file = await getFileByName(filename);
    res.json(file);
  } catch (err) {
    if (err.message === 'File not found') {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch file' });
    }
  }
});

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });
export default app