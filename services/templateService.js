const templateRepository = require('../repositories/templateRepository');
const minioClient = require('../config/minio');

exports.createTemplate = async (templateData, file, thumbnails) => {
    const bucketName = 'templates';
    const fileName = Date.now() + '-' + file.originalname;
    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, { 'Content-Type': file.mimetype });
    const fileUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${fileName}`;

    templateData.url_minio_preview = fileUrl;

    const thumbnailUrls = [];
    for (const thumbnail of thumbnails) {
        const thumbnailName = Date.now() + '-' + thumbnail.originalname;
        await minioClient.putObject(bucketName, thumbnailName, thumbnail.buffer, thumbnail.size, { 'Content-Type': thumbnail.mimetype });
        const thumbnailUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${thumbnailName}`;
        thumbnailUrls.push(thumbnailUrl);
    }

    const createdTemplate = await templateRepository.createTemplate({
        ...templateData,
        url_minio_thumbnail: JSON.stringify(thumbnailUrls)  // Make sure this matches your database column and JSON structure
    });

    // Reordering JSON output for response
    return {
        id: createdTemplate.id,
        template_name: createdTemplate.template_name,
        publisher: createdTemplate.publisher,
        id_template: createdTemplate.id_template,
        url_minio_preview: createdTemplate.url_minio_preview,
        url_minio_thumbnails: thumbnailUrls, // This ensures thumbnails are correctly positioned in the response
        createdAt: createdTemplate.createdAt,
        updatedAt: createdTemplate.updatedAt
    };
};

exports.getAllTemplates = async (page, limit) => {
    const offset = (page - 1) * limit;

    const { rows, count } = await templateRepository.getAllTemplates(offset, limit);
    const totalPages = Math.ceil(count / limit);

    return {
        data: rows.map(template => ({
            id: template.id,
            template_name: template.template_name,
            publisher: template.publisher,
            url_minio_preview: template.url_minio_preview,
            url_minio_thumbnails: JSON.parse(template.url_minio_thumbnail || '[]'),
            id_template: template.id_template,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt
        })),
        metadata: {
            pageInfo: {
                currentPage: page,
                totalItems: count,
                totalPages: totalPages
            }
        }
    };
};

exports.getTemplateByGenericId = async (genericId) => {
    let template = await templateRepository.findTemplateById(genericId);
    if (!template) {
        template = await templateRepository.findTemplateByIdTemplate(genericId);
    }

    if (!template) throw new Error('Template not found');

    return {
        id: template.id,
        template_name: template.template_name,
        publisher: template.publisher,
        url_minio_preview: template.url_minio_preview,
        url_minio_thumbnails: JSON.parse(template.url_minio_thumbnail || '[]'),
        id_template: template.id_template,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
    };
};



exports.updateTemplate = async (id, updateData, newFile, newThumbnails) => {
    const bucketName = 'templates';
    const template = await templateRepository.findTemplateById(id);
    if (!template) {
        throw new Error('Template not found');
    }

    let newUrlMinioPreview = template.url_minio_preview;
    if (newFile) {
        const oldFileName = newUrlMinioPreview.split('/').pop();
        await minioClient.removeObject(bucketName, oldFileName);

        const newFileName = Date.now().toString() + '-' + newFile.originalname;
        await minioClient.putObject(bucketName, newFileName, newFile.buffer, newFile.size, { 'Content-Type': newFile.mimetype });
        newUrlMinioPreview = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${newFileName}`;
    }

    let newThumbnailUrls = [];
    if (newThumbnails && newThumbnails.length > 0) {
        const existingThumbnails = JSON.parse(template.url_minio_thumbnail || '[]');
        for (let oldThumbnailUrl of existingThumbnails) {
            const oldThumbnailName = oldThumbnailUrl.split('/').pop();
            await minioClient.removeObject(bucketName, oldThumbnailName);
        }

        for (const thumbnail of newThumbnails) {
            const thumbnailName = Date.now() + '-' + thumbnail.originalname;
            await minioClient.putObject(bucketName, thumbnailName, thumbnail.buffer, thumbnail.size, { 'Content-Type': thumbnail.mimetype });
            const thumbnailUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${thumbnailName}`;
            newThumbnailUrls.push(thumbnailUrl);
        }
    }

    const updatedTemplate = await templateRepository.updateTemplate(id, {
        template_name: updateData.template_name,
        publisher: updateData.publisher,
        url_minio_preview: newUrlMinioPreview,
        url_minio_thumbnail: JSON.stringify(newThumbnailUrls), // Ensure to store it as a JSON string
        id_template: updateData.id_template
    });

    return updatedTemplate;
};

exports.deleteTemplate = async (id) => {
    const template = await templateRepository.findTemplateById(id);
    if (!template) throw new Error('Template not found');

    // Delete file from Minio
    const fileUrl = template.url_minio_preview;
    const fileName = fileUrl.split('/').pop();
    await minioClient.removeObject('templates', fileName);

    // Delete thumbnails from Minio
    const thumbnailUrls = JSON.parse(template.url_minio_thumbnail || '[]');
    thumbnailUrls.forEach(async (url) => {
        const thumbnailName = url.split('/').pop();
        await minioClient.removeObject('templates', thumbnailName);
    });

    // Delete template from database
    await templateRepository.deleteTemplate(id);
    return { message: 'Template successfully deleted' };
};

exports.downloadTemplateFile = async (id) => {
    // Mencari template berdasarkan ID
    const template = await templateRepository.getTemplateById(id);

    if (!template) throw new Error('Template not found');
    
    // Mengambil file dari MinIO berdasarkan URL preview template
    const fileUrl = template.url_minio_preview;
    const fileName = fileUrl.split('/').pop();

    // Mengambil file dari MinIO
    const fileStream = await templateRepository.getFileFromMinio(fileName);

    // Mengembalikan file stream agar bisa didownload
    return {
        fileName,
        fileStream,
        mimeType: 'application/octet-stream' // Anda bisa menyesuaikan mimeType jika diperlukan
    };
};