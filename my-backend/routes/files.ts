import express from 'express';
import { saveData, getFiles, downloadFile, previewFile } from '../controllers/filesController';

const router = express.Router();

router.post('/save-data', saveData);
router.get('/files', getFiles);
router.get('/download', downloadFile);
router.get('/preview', previewFile);

export default router; 