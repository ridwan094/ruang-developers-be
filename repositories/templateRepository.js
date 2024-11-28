const { Template } = require('../models');
const minioClient = require('../config/minio');

exports.createTemplate = async (templateData) => {
    return await Template.create({
        ...templateData,
        url_minio_thumbnail: templateData.url_minio_thumbnail
    });
};

exports.getAllTemplates = async (offset, limit) => {
    return await Template.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [['createdAt', 'DESC']]
    });
};

exports.findTemplateById = async (id) => {
    return await Template.findByPk(id);
};

exports.findTemplateByIdTemplate = async (id_template) => {
    return await Template.findOne({ where: { id_template } });
};

exports.updateTemplate = async (id, updateData) => {
    let template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');

    await template.update(updateData);

    return template;
};

exports.deleteTemplate = async (id) => {
    const template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');
    await template.destroy();
};

exports.getTemplateById = async (id) => {
    // Mencari template berdasarkan ID
    const template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');
    
    return template;
};

exports.getFileFromMinio = async (fileName) => {
    // Mengambil file dari MinIO menggunakan nama file
    try {
        const stream = await minioClient.getObject('templates', fileName);
        return stream;
    } catch (err) {
        throw new Error('Error downloading file from MinIO: ' + err.message);
    }
};