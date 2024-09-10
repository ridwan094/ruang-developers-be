const express = require('express');
const videoController = require('../controllers/videoController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/videos', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), videoController.uploadVideo);
router.get('/videos', videoController.getAllVideos);
router.get('/videos/:id', videoController.getVideoDetails);
router.put('/videos/:id', upload.single('file'), videoController.uploadVideo);
router.delete('/videos/:id', videoController.deleteVideo);

module.exports = router;
