const videoRepository = require('../repositories/MasterDataVideoRepository');
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

    const status = videoData.status || 'inactive'; 

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
                name_publisher: video.detail ? video.detail.name_publisher : null,
                url_minio_video: video.detail ? video.detail.url_minio_video : null,
                url_minio_thumbnail: video.detail ? video.detail.url_minio_thumbnail : null,
                description: video.detail ? video.detail.description : null,
                views: video.detail ? video.detail.views : 0,
                status: video.detail ? video.detail.status : 'unknown',
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
    let video = await videoRepository.getVideoById(videoId);

    if (!video) {
        throw new Error('Video not found');
    }

    if (video.detail.status === 'published') {
        await videoRepository.incrementViews(videoId);

        video = await videoRepository.getVideoById(videoId);
    }

    return {
        id: video.id,
        name: video.name, 
        description: video.detail.description,
        url_minio_video: video.detail.url_minio_video,
        url_minio_thumbnail: video.detail.url_minio_thumbnail,
        name_publisher: video.detail.name_publisher,
        views: video.detail.views,
        status: video.detail.status,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt
    };
};

exports.updateVideo = async (id, videoData, file, thumbnail) => {
    try {
        const bucketName = 'master-data-videos';
        const video = await videoRepository.getVideoById(id);

        if (!video) {
            throw new Error('Video tidak ditemukan');
        }

        let videoUrl = video.detail.url_minio_video;
        let thumbnailUrl = video.detail.url_minio_thumbnail;

        // Upload video baru jika ada file yang diupload
        if (file) {
            const fileName = Date.now().toString() + '-' + file.originalname;
            await minioClient.putObject(bucketName, fileName, file.buffer, file.size, { 'Content-Type': file.mimetype });
            videoUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${fileName}`;
        }

        // Upload thumbnail baru jika ada
        if (thumbnail) {
            const thumbnailName = Date.now().toString() + '-' + thumbnail.originalname;
            await minioClient.putObject(bucketName, thumbnailName, thumbnail.buffer, thumbnail.size, { 'Content-Type': thumbnail.mimetype });
            thumbnailUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${thumbnailName}`;
        }

        // Update data video di repository
        const updatedVideo = await videoRepository.updateVideo(id, {
            name: videoData.name,
            description: videoData.description,
            name_publisher: videoData.name_publisher,
            status: videoData.status
        }, videoUrl, thumbnailUrl);

        // Pastikan data yang diambil adalah data yang baru saja diupdate
        return {
            id: updatedVideo.video.id,
            name: updatedVideo.video.name, // Nama baru yang diupdate
            description: updatedVideo.videoDetail.description,
            url_minio_video: updatedVideo.videoDetail.url_minio_video,
            url_minio_thumbnail: updatedVideo.videoDetail.url_minio_thumbnail,
            name_publisher: updatedVideo.videoDetail.name_publisher,
            views: updatedVideo.videoDetail.views,
            status: updatedVideo.videoDetail.status,
            createdAt: updatedVideo.video.createdAt,
            updatedAt: updatedVideo.video.updatedAt
        };
    } catch (err) {
        console.error('Error updating video:', err);
        throw err;
    }
};

exports.getVideosWithPagination = async (offset, limit, sortBy, sortDirection) => {
    try {
        const videos = await videoRepository.fetchVideos(offset, limit, sortBy, sortDirection);
        const totalVideos = await videoRepository.countAllVideos();

        const totalPages = Math.ceil(totalVideos / limit);

        return {
            data: videos.rows.map(video => ({
                id: video.id,
                name: video.name,
                name_publisher: video.detail ? video.detail.name_publisher : null,
                url_minio_video: video.detail ? video.detail.url_minio_video : null,
                url_minio_thumbnail: video.detail ? video.detail.url_minio_thumbnail : null,
                description: video.detail ? video.detail.description : null,
                views: video.detail ? video.detail.views : 0,
                status: video.detail ? video.detail.status : 'unknown',
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            })),
            metadata: {
                pageInfo: {
                    currentPage: Math.ceil(offset / limit) + 1,
                    totalDataServer: totalVideos,
                    totalPageServer: totalPages
                }
            }
        };
    } catch (error) {
        console.error('Error fetching videos with pagination:', error);
        throw error;
    }
};

exports.filterVideos = async (video_name, offset, limit, sortBy, sortDirection) => {
    try {
        const videos = await videoRepository.filterVideos(video_name, offset, limit, sortBy, sortDirection);
        
        const totalVideos = await videoRepository.countFilteredVideos(video_name);
        const totalPages = Math.ceil(totalVideos / limit);

        return {
            data: videos.rows.map(video => ({
                id: video.id,
                name: video.name,
                name_publisher: video.detail ? video.detail.name_publisher : null,
                url_minio_video: video.detail ? video.detail.url_minio_video : null,
                url_minio_thumbnail: video.detail ? video.detail.url_minio_thumbnail : null,
                description: video.detail ? video.detail.description : null,
                views: video.detail ? video.detail.views : 0,
                status: video.detail ? video.detail.status : 'unknown',
                createdAt: video.createdAt,
                updatedAt: video.updatedAt
            })),
            metadata: {
                pageInfo: {
                    currentPage: offset / limit + 1,
                    totalDataServer: totalVideos,
                    totalPageServer: totalPages
                }
            }
        };
    } catch (error) {
        console.error('Error filtering videos:', error);
        throw error;
    }
};

exports.filterVideosByStatus = async (status, offset, limit, sortBy, sortDirection) => {
    try {
        const result = await videoRepository.filterVideosByStatus(status, offset, limit, sortBy, sortDirection);

        // Kita bisa modifikasi response jika dibutuhkan
        const videos = result.rows.map(video => ({
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
        }));

        return {
            count: result.count,
            rows: videos
        };
    } catch (err) {
        console.error('Error in videoService.filterVideosByStatus:', err);
        throw err;
    }
};

exports.deleteVideo = async (videoId) => {
    try {
        const video = await videoRepository.getVideoById(videoId);

        if (!video) {
            throw new Error('Video not found');
        }

        const bucketName = 'master-data-videos';

        if (video.detail.url_minio_video) {
            const videoName = video.detail.url_minio_video.split('/').pop();
            try {
                await minioClient.removeObject(bucketName, videoName);
                console.log(`Video ${videoName} deleted successfully from Minio`);
            } catch (err) {
                console.error(`Error occurred while deleting the video from Minio: ${err.message}`);
                throw new Error('Error deleting video from storage');
            }
        }

        if (video.detail.url_minio_thumbnail) {
            const thumbnailName = video.detail.url_minio_thumbnail.split('/').pop();
            try {
                await minioClient.removeObject(bucketName, thumbnailName);
                console.log(`Thumbnail ${thumbnailName} deleted successfully from Minio`);
            } catch (err) {
                console.error(`Error occurred while deleting the thumbnail from Minio: ${err.message}`);
                throw new Error('Error deleting thumbnail from storage');
            }
        }

        await videoRepository.deleteVideo(videoId);

        return { message: 'Video and associated files successfully deleted' };
    } catch (err) {
        console.error('Error deleting video:', err);
        throw new Error(err.message);
    }
};