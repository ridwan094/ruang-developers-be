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
        include: [{
            model: DetailVideo, 
            as: 'detail',
            attributes: ['description', 'url_minio_video', 'url_minio_thumbnail', 'name_publisher', 'views', 'status']
        }],
        attributes: ['id', 'name', 'createdAt', 'updatedAt']
    });
};

exports.updateVideo = async (id, videoData, videoUrl, thumbnailUrl) => {
    const video = await MasterDataVideo.findOne({ where: { id: id } });
    if (!video) throw new Error('Video tidak ditemukan');

    await video.update({
        name: videoData.name || video.name,
        updatedAt: new Date()
    });

    const videoDetail = await DetailVideo.findOne({ where: { masterDataVideoId: id } });
    if (!videoDetail) throw new Error('Detail video tidak ditemukan');

    await videoDetail.update({
        description: videoData.description || videoDetail.description,
        name_publisher: videoData.name_publisher || videoDetail.name_publisher,
        url_minio_video: videoUrl || videoDetail.url_minio_video,
        url_minio_thumbnail: thumbnailUrl || videoDetail.url_minio_thumbnail,
        status: videoData.status || videoDetail.status
    });

    return { video, videoDetail };
};

exports.filterVideos = async (video_name, offset, limit, sortBy, sortDirection) => {
    return await MasterDataVideo.findAndCountAll({
        where: {
            name: {
                [Op.like]: `%${video_name}%`
            }
        },
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

exports.countFilteredVideos = async (video_name) => {
    return await MasterDataVideo.count({
        where: {
            name: {
                [Op.like]: `%${video_name}%`
            }
        }
    });
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