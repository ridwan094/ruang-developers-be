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
                attributes: ['name_publisher', 'url_minio_video', 'url_minio_thumbnail', 'description', 'views', 'status']
            }
        ]
    });
};

exports.getTotalVideos = async () => {
    return await MasterDataVideo.count(); // Menghitung total video
};

exports.getVideoById = async (videoId) => {
    return await MasterDataVideo.findOne({ where: { id: videoId }, include: 'detail' });
};

exports.updateVideo = async (id, videoData) => {
    const video = await MasterDataVideo.findByPk(id);
    if (!video) throw new Error('Video not found');
    await video.update(videoData);
    return video;
};

exports.deleteVideo = async (id) => {
    const video = await MasterDataVideo.findByPk(id);
    if (!video) throw new Error('Video not found');
    await video.destroy();
};
