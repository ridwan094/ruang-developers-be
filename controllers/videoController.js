const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const videoService = require('../services/videoService');

exports.uploadVideo = async (req, res) => {
    try {
        const { name, description, name_publisher, status } = req.body;
        const file = req.files.file ? req.files.file[0] : null;
        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null;

        if (!file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const video = await videoService.uploadVideo({ name, description, name_publisher, status }, file, thumbnail);
        res.status(201).json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 100;

        const videos = await videoService.getAllVideos(page, limit);

        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};


exports.getVideoDetails = async (req, res) => {
    try {
        const video = await videoService.getVideoDetails(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.json(video);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        await videoService.deleteVideo(req.params.id);
        res.status(204).json({ message: 'Video deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
