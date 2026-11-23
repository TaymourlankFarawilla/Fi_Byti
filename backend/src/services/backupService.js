const path = require('path');
const fs = require('fs');
const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

const backupsDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

function createDatabaseBackup(backupType = 'MANUAL') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `fi_byti_backup_${timestamp}.db`;
  const backupFilePath = path.join(backupsDir, backupFileName);

  // SQLite online backup execution
  db.backup(backupFilePath);

  const stats = fs.statSync(backupFilePath);

  const backupId = uuidv4();
  db.prepare(`
    INSERT INTO database_backups (id, filename, file_size, backup_type)
    VALUES (?, ?, ?, ?)
  `).run(backupId, backupFileName, stats.size, backupType);

  return {
    id: backupId,
    filename: backupFileName,
    fileSize: stats.size,
    backupType,
    filePath: backupFilePath,
    createdAt: new Date()
  };
}

// Scheduled daily backup task setup (.unref() prevents keeping Node event loop open)
const dailyTimer = setInterval(() => {
  try {
    createDatabaseBackup('AUTOMATED_DAILY');
  } catch (err) {
    console.error('Automated daily backup failed:', err);
  }
}, 24 * 60 * 60 * 1000);

if (dailyTimer && dailyTimer.unref) {
  dailyTimer.unref();
}

module.exports = {
  createDatabaseBackup,
  backupsDir
};
