const express = require('express');
const fileController = require('../controllers/fileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/files', upload.single('file'), fileController.uploadFile);
router.get('/files', fileController.getAllFiles);
router.get('/files/:id', fileController.getFileById);
router.put('/files/:id', upload.single('file'), fileController.updateFile);
router.delete('/files/:id', fileController.deleteFile);
router.get('/files/download/:id', fileController.downloadFileById);
router.post('/files/status', fileController.getFilesByStatus);

module.exports = router;
