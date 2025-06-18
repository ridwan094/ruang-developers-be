const fileRepository = require('../repositories/masterDataFileRepository');
const minioClient = require('../config/minio');
const { MasterDataFile } = require('../models');

exports.uploadFile = async (fileData, file) => {
    const bucketName = 'files';
    const metaData = { 'Content-Type': file.mimetype };
    const originalFileName = Date.now().toString() + '-' + file.originalname;
    const encodedFileName = encodeURIComponent(originalFileName);

    await minioClient.putObject(bucketName, originalFileName, file.buffer, file.size, metaData);
    const minioHost = process.env.MINIO_HOST || 'localhost';
    const fileUrl = `http://${minioHost}:${minioClient.port}/${bucketName}/${encodedFileName}`;

    const status = fileData.status || 'inactive';

    const uploadedFile = await fileRepository.createFile({
        title: fileData.title,
        author: fileData.author,
        url_minio_files: fileUrl,
        description: fileData.description,
        status: status
    });

    return uploadedFile;
};

exports.getAllFiles = async (page, limit) => {
    const offset = (page - 1) * limit;

    const { rows: files, count: totalFiles } = await fileRepository.getAllFiles(offset, limit);

    const totalPages = Math.ceil(totalFiles / limit);

    const result = {
        data: files.map(file => ({
            id: file.id,
            title: file.title,
            author: file.author,
            url_minio_files: file.url_minio_files,
            description: file.description,
            status: file.status,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt
        })),
        metadata: {
            pageInfo: {
                currentPage: page,
                totalDataServer: totalFiles,
                totalPageServer: totalPages
            }
        }
    };

    return result;
};

exports.getFileById = async (fileId) => {
    return await fileRepository.getFileById(fileId);
};

exports.updateFile = async (id, fileData, file) => {
    try {
        const bucketName = 'files';
        const existingFile = await fileRepository.getFileById(id);

        if (!existingFile) {
            throw new Error('File tidak ditemukan');
        }

        let fileUrl = existingFile.url_minio_files;

        if (file) {
            if (fileUrl) {
                const oldFileName = decodeURIComponent(fileUrl.split('/').pop());
                await minioClient.removeObject(bucketName, oldFileName);
            }

            const originalFileName = Date.now().toString() + '-' + file.originalname;
            const encodedFileName = encodeURIComponent(originalFileName);

            await minioClient.putObject(bucketName, originalFileName, file.buffer, file.size, { 'Content-Type': file.mimetype });
            const minioHost = process.env.MINIO_HOST || 'localhost';
            fileUrl = `http://${minioHost}:${minioClient.port}/${bucketName}/${encodedFileName}`;
        }

        const updatedFile = await fileRepository.updateFile(id, {
            title: fileData.title,
            author: fileData.author,
            description: fileData.description,
            url_minio_files: fileUrl,
            status: fileData.status
        });

        return updatedFile;
    } catch (err) {
        console.error('Error updating file:', err);
        throw err;
    }
};

exports.deleteFile = async (fileId) => {
    const file = await fileRepository.getFileById(fileId);

    if (!file) {
        throw new Error('File tidak ditemukan');
    }

    const bucketName = 'files';
    const fileNameInMinio = decodeURIComponent(file.url_minio_files.split('/').pop());

    await minioClient.removeObject(bucketName, fileNameInMinio);

    await fileRepository.deleteFile(fileId);

    return file;
};

exports.getFileStream = async (fileUrl) => {
    const bucketName = 'files';
    const fileName = decodeURIComponent(fileUrl.split('/').pop());
    return minioClient.getObject(bucketName, fileName);
};

exports.getFilesByStatus = async (status, pageStart = 1, sortBy = 'createdAt', sortDirection = 'desc') => {
    const pageSize = 10; // Sesuaikan dengan kebutuhan Anda
    const offset = (pageStart - 1) * pageSize;

    const files = await MasterDataFile.findAndCountAll({
        where: { status },
        limit: pageSize,
        offset: offset,
        order: [[sortBy, sortDirection.toUpperCase()]]
    });

    const totalDataServer = files.count;
    const totalPageServer = Math.ceil(totalDataServer / pageSize);

    return {
        data: files.rows,
        metadata: {
            pageInfo: {
                currentPage: pageStart,
                totalDataServer: totalDataServer,
                totalPageServer: totalPageServer
            }
        }
    };
};

