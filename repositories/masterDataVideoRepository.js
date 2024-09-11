const { where, Op } = require('sequelize');
const { MasterDataVideo, DetailVideo } = require('../models');

exports.createVideo = async (videoData) => {
    return await MasterDataVideo.create(videoData);
};

exports.createVideoDetail = async (detailData) => {
    return await DetailVideo.create(detailData);
};

exports.getAllVideos = async (offset, limit) => {
    return await MasterDataVideo.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: DetailVideo,
                as: 'detail',
                attributes: ['name_publisher', 'url_minio_video', 'url_minio_thumbnail', 'description', 'views', 'status'],
                where: {
                    status: {
                        [Op.ne]: 'deleted'
                    }
                },
                required: false
            }
        ]
    });
};

exports.fetchVideos = async (offset, limit, sortBy, sortDirection) => {
    return await MasterDataVideo.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [[sortBy, sortDirection]],
        include: [
            {
                model: DetailVideo,
                as: 'detail',
                attributes: ['name_publisher', 'url_minio_video', 'url_minio_thumbnail', 'description', 'views', 'status'],
                required: false
            }
        ]
    });
};

exports.countAllVideos = async () => {
    return await MasterDataVideo.count();
};

exports.getTotalVideos = async () => {
    return await MasterDataVideo.count();
};

exports.getVideoById = async (videoId) => {
    return await MasterDataVideo.findOne({
        where: { id: videoId },
        include: 'detail'
    });
};

exports.updateVideo = async (id, videoData, videoUrl, thumbnailUrl) => {
    const video = await DetailVideo.findOne({ where: { masterDataVideoId: id } });
    if (!video) throw new Error('Video not found');

    await video.update({
        ...videoData,
        url_minio_video: videoUrl || video.url_minio_video,
        url_minio_thumbnail: thumbnailUrl || video.url_minio_thumbnail
    });

    return video;
};


exports.deleteVideo = async (id) => {
    const videoDetail = await DetailVideo.findOne({ where: { masterDataVideoId: id } });
    if (!videoDetail) throw new Error('Video detail not found');

    await videoDetail.destroy();

    const masterVideo = await MasterDataVideo.findOne({ where: { id } });
    if (!masterVideo) throw new Error('Master video not found');

    await masterVideo.destroy();
};

exports.incrementViews = async (videoId) => {
    await DetailVideo.increment('views', { where: { id: videoId } });
};