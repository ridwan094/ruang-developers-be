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
        const limit = 2;

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

exports.updateVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const { name, description, name_publisher, status } = req.body;
        const file = req.files?.file ? req.files.file[0] : null;
        const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0] : null;

        const updatedVideo = await videoService.updateVideo(videoId, { name, description, name_publisher, status }, file, thumbnail);

        return res.status(200).json(updatedVideo);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


exports.fetchVideos = async (req, res) => {
    try {
        const { pageStart = 1, sortBy = 'createdAt', sortDirection = 'desc' } = req.body;
        const limit = 2;
        const offset = (pageStart - 1) * limit;

        const result = await videoService.getVideosWithPagination(offset, limit, sortBy, sortDirection);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.filterVideos = async (req, res) => {
    try {
        const { video_name = "", pageStart = 1, sortBy = "createdAt", sortDirection = "desc" } = req.body;
        const limit = 2;
        const offset = (pageStart - 1) * limit;

        const videos = await videoService.filterVideos(video_name, offset, limit, sortBy, sortDirection);
        
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to filter videos' });
    }
};

exports.filterVideosByStatus = async (req, res) => {
    try {
        const { status, pageStart = 1, sortBy = "createdAt", sortDirection = "desc" } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const limit = 2;
        const offset = (pageStart - 1) * limit;

        const videos = await videoService.filterVideosByStatus(status, offset, limit, sortBy, sortDirection);

        res.status(200).json(videos);
    } catch (err) {
        console.error("Error filtering videos by status:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const result = await videoService.deleteVideo(videoId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
