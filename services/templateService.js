const templateRepository = require('../repositories/templateRepository');
const minioClient = require('../config/minio');

exports.createTemplate = async (templateData, file) => {
    const bucketName = 'templates';
    const fileName = Date.now() + '-' + file.originalname;
    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, { 'Content-Type': file.mimetype });
    const fileUrl = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${fileName}`;

    templateData.url_minio_preview = fileUrl;

    return await templateRepository.createTemplate(templateData);
};

exports.getAllTemplates = async (page, limit) => {
    const offset = (page - 1) * limit;

    try {
        const { rows, count } = await templateRepository.getAllTemplates(offset, limit);
        const totalPages = Math.ceil(count / limit);

        const result = {
            data: rows.map(template => ({
                id: template.id,
                template_name: template.template_name,
                publisher: template.publisher,
                url_minio_preview: template.url_minio_preview,
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

        return result;
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
};

exports.getTemplateDetails = async (id) => {
    return await templateRepository.findTemplateById(id);
};

exports.updateTemplate = async (id, updateData, newFile) => {
    const bucketName = 'templates';
    
    const template = await templateRepository.findTemplateById(id); // Correct the function name here
    if (!template) {
        throw new Error('Template not found');
    }

    let newUrlMinioPreview = template.url_minio_preview;

    if (newFile) {
        const fileName = Date.now().toString() + '-' + newFile.originalname;
        const metaData = { 'Content-Type': newFile.mimetype };

        const oldFileName = template.url_minio_preview.split('/').pop();
        await minioClient.removeObject(bucketName, oldFileName);

        await minioClient.putObject(bucketName, fileName, newFile.buffer, newFile.size, metaData);
        newUrlMinioPreview = `http://${process.env.MINIO_HOST}:${minioClient.port}/${bucketName}/${fileName}`;
    }

    const updatedTemplate = await templateRepository.updateTemplate(id, {
        template_name: updateData.template_name,
        publisher: updateData.publisher,
        url_minio_preview: newUrlMinioPreview,
        id_template: updateData.id_template
    });

    return updatedTemplate;
};

exports.deleteTemplate = async (id) => {
    const template = await templateRepository.findTemplateById(id);
    if (!template) {
        throw new Error('Template not found');
    }

    const bucketName = 'templates';
    const fileName = template.url_minio_preview.split('/').pop();

    try {
        await minioClient.removeObject(bucketName, fileName);
    } catch (error) {
        console.error('Error removing file from Minio:', error);
        throw new Error('Failed to delete file from storage');
    }

    await templateRepository.deleteTemplate(id);
    return { message: 'Template successfully deleted along with its file in Minio' };
};
