import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const syncRouter = Router();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'cloud_backups');
const DOCS_DIR = path.join(DATA_DIR, 'uploads', 'documents');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
}

ensureDirs();

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.@]/g, '_');
}

/**
 * POST /api/sync/backup
 * Saves a full database & document snapshot permanently on the server
 */
syncRouter.post('/backup', (req: Request, res: Response) => {
  try {
    ensureDirs();
    const { userEmail, institutionId, snapshot, timestamp } = req.body;

    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid snapshot data' });
    }

    const payload = {
      userEmail: userEmail || 'mominulislam186265@gmail.com',
      institutionId: institutionId || 'inst-banir-khamar',
      timestamp: timestamp || new Date().toISOString(),
      keyCount: Object.keys(snapshot).length,
      snapshot,
    };

    const payloadStr = JSON.stringify(payload, null, 2);

    // Save with primary user email
    if (userEmail) {
      const userFile = path.join(BACKUP_DIR, `backup-${sanitizeFilename(userEmail.toLowerCase())}.json`);
      fs.writeFileSync(userFile, payloadStr, 'utf-8');
    }

    // Save with institution ID
    if (institutionId) {
      const instFile = path.join(BACKUP_DIR, `backup-${sanitizeFilename(institutionId)}.json`);
      fs.writeFileSync(instFile, payloadStr, 'utf-8');
    }

    // Always update global latest backup
    const latestFile = path.join(BACKUP_DIR, 'latest_backup.json');
    fs.writeFileSync(latestFile, payloadStr, 'utf-8');

    return res.json({
      success: true,
      message: 'ক্লাউড ব্যাকআপ সফলভাবে সার্ভারে সংরক্ষিত হয়েছে।',
      timestamp: payload.timestamp,
      keyCount: payload.keyCount,
    });
  } catch (err: any) {
    console.error('[CloudSync] Error saving backup:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to save cloud backup' });
  }
});

/**
 * GET /api/sync/pull
 * Retrieves the latest cloud backup snapshot for the user or institution
 */
syncRouter.get('/pull', (req: Request, res: Response) => {
  try {
    ensureDirs();
    const userEmail = (req.query.userEmail as string)?.toLowerCase().trim();
    const institutionId = (req.query.institutionId as string)?.trim();

    let targetFile: string | null = null;

    if (userEmail) {
      const uPath = path.join(BACKUP_DIR, `backup-${sanitizeFilename(userEmail)}.json`);
      if (fs.existsSync(uPath)) targetFile = uPath;
    }

    if (!targetFile && institutionId) {
      const iPath = path.join(BACKUP_DIR, `backup-${sanitizeFilename(institutionId)}.json`);
      if (fs.existsSync(iPath)) targetFile = iPath;
    }

    // Fallback to latest global backup
    if (!targetFile) {
      const lPath = path.join(BACKUP_DIR, 'latest_backup.json');
      if (fs.existsSync(lPath)) targetFile = lPath;
    }

    if (!targetFile || !fs.existsSync(targetFile)) {
      return res.json({
        success: true,
        exists: false,
        message: 'সার্ভারে এখনও কোনো ক্লাউড ব্যাকআপ ফাইল নেই।',
      });
    }

    const fileContent = fs.readFileSync(targetFile, 'utf-8');
    const parsed = JSON.parse(fileContent);

    return res.json({
      success: true,
      exists: true,
      timestamp: parsed.timestamp,
      keyCount: parsed.keyCount || Object.keys(parsed.snapshot || {}).length,
      snapshot: parsed.snapshot,
    });
  } catch (err: any) {
    console.error('[CloudSync] Error pulling backup:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to pull cloud backup' });
  }
});

/**
 * GET /api/sync/status
 * Returns current status of cloud backups
 */
syncRouter.get('/status', (_req: Request, res: Response) => {
  try {
    ensureDirs();
    const latestFile = path.join(BACKUP_DIR, 'latest_backup.json');
    if (!fs.existsSync(latestFile)) {
      return res.json({
        success: true,
        hasBackup: false,
        message: 'No cloud backups found yet',
      });
    }

    const stat = fs.statSync(latestFile);
    const content = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));

    return res.json({
      success: true,
      hasBackup: true,
      lastSynced: content.timestamp || stat.mtime.toISOString(),
      keyCount: content.keyCount || Object.keys(content.snapshot || {}).length,
      fileSizeKb: Math.round(stat.size / 1024),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to check backup status' });
  }
});

/**
 * POST /api/sync/upload-doc
 * Allows storing binary/base64 documents directly in the server file vault
 */
syncRouter.post('/upload-doc', (req: Request, res: Response) => {
  try {
    ensureDirs();
    const { fileName, fileType, base64Data, category, ownerName } = req.body;

    if (!fileName || !base64Data) {
      return res.status(400).json({ success: false, message: 'Missing fileName or base64Data' });
    }

    // Strip data URL header if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const fileId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const ext = path.extname(fileName) || '.bin';
    const safeName = `${fileId}${ext}`;
    const filePath = path.join(DOCS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);

    const docUrl = `/api/sync/documents/${safeName}`;

    return res.json({
      success: true,
      fileId,
      fileName,
      fileType: fileType || ext.replace('.', '').toUpperCase(),
      fileUrl: docUrl,
      fileSize: `${(buffer.length / 1024).toFixed(1)} KB`,
      category: category || 'institution_document',
      ownerName: ownerName || 'মাদ্রাসা কর্তৃপক্ষ',
      message: 'ডকুমেন্ট সার্ভার ভল্টে সফলভাবে সংরক্ষিত হয়েছে।',
    });
  } catch (err: any) {
    console.error('[CloudSync] Error saving document:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to save document' });
  }
});

/**
 * GET /api/sync/documents/:fileName
 * Streams requested document file
 */
syncRouter.get('/documents/:fileName', (req: Request, res: Response) => {
  try {
    ensureDirs();
    const safeName = sanitizeFilename(req.params.fileName);
    const filePath = path.join(DOCS_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Document not found');
    }

    res.sendFile(filePath);
  } catch (err: any) {
    res.status(500).send('Error serving document');
  }
});

/**
 * GET /api/sync/download-backup
 * Direct attachment download of the latest backup JSON file
 */
syncRouter.get('/download-backup', (_req: Request, res: Response) => {
  try {
    ensureDirs();
    const latestFile = path.join(BACKUP_DIR, 'latest_backup.json');
    if (!fs.existsSync(latestFile)) {
      return res.status(404).json({ success: false, message: 'No backup found to download' });
    }

    res.download(latestFile, `madsol-backup-${new Date().toISOString().slice(0, 10)}.json`);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error downloading backup' });
  }
});
