const videoRepository = require('../repositories/masterDataVideoRepository');
const minioClient = require('../config/minio');

exports.uploadVideo = async (videoData, file, thumbnail) => {
    const bucketName = 'master-data-videos';
    const metaData = { 'Content-Type': file.mimetype };
    const fileName = Date.now().toString() + '-' + file.originalname;

    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, metaData);
    const minioHost = process.env.MINIO_HOST || 'localhost';
    const videoUrl = `http://${minioHost}:${minioClient.port}/${bucketName}/${fileName}`;

    let thumbnailUrl = '';
    if (thumbnail) {
        const thumbnailName = Date.now().toString() + '-' + thumbnail.originalname;
        const thumbnailMetaData = { 'Content-Type': thumbnail.mimetype };
        await minioClient.putObject(bucketName, thumbnailName, thumbnail.buffer, thumbnail.size, thumbnailMetaData);
        thumbnailUrl = `http://${minioHost}:${minioClient.port}/${bucketName}/${thumbnailName}`;
    }

    const status = videoData.status || 'not_published'; 

    const video = await videoRepository.createVideo({
        name: videoData.name,
        description: videoData.description
    });

    await videoRepository.createVideoDetail({
        name_publisher: videoData.name_publisher,
        url_minio_video: videoUrl,
        url_minio_thumbnail: thumbnailUrl,
        description: videoData.description,
        status: status,
        masterDataVideoId: video.id
    });

    return {
        id: video.id,
        name: videoData.name,
        description: videoData.description,
        url_minio_video: videoUrl,
        url_minio_thumbnail: thumbnailUrl,
        status: status,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt
    };
};


exports.getAllVideos = async (page, limit) => {
    const offset = (page - 1) * limit;

    try {
        const videos = await videoRepository.getAllVideos(offset, limit);

        const totalVideos = await videoRepository.getTotalVideos();

        const totalPageServer = Math.ceil(totalVideos / limit);

        const result = {
            data: videos.rows.map(video => ({
                id: video.id,
                name: video.name,
                name_publisher: video.detail.name_publisher,
                url_minio_video: video.detail.url_minio_video,
                url_minio_thumbnail: video.detail.url_minio_thumbnail,
                description: video.detail.description,
                views: video.detail.views,
                status: video.detail.status,
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            })),
            metadata: {
                pageInfo: {
                    currentPage: page,
                    totalDataServer: totalVideos,
                    totalPageServer: totalPageServer
                }
            }
        };

        return result;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
};


exports.getVideoDetails = async (videoId) => {
    return videoRepository.getVideoById(videoId);
};

exports.updateVideo = async (id, videoData, file, thumbnail) => {
    return videoRepository.updateVideo(id, videoData);
};

exports.deleteVideo = async (id) => {
    return videoRepository.deleteVideo(id);
};
