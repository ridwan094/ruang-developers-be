const express = require('express');
const videoController = require('../controllers/videoController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/videos', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), videoController.uploadVideo);
router.get('/videos', videoController.getAllVideos);
router.get('/videos/:id', videoController.getVideoDetails);
router.put('/videos/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), videoController.updateVideo);
router.post('/videos/fetch', videoController.fetchVideos);
router.post('/videos/filter', videoController.filterVideos);
router.delete('/videos/:id', videoController.deleteVideo);
router.get('/videos/published', videoController.getPublishedVideos);

module.exports = router;
