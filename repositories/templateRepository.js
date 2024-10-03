const { Template } = require('../models');

exports.createTemplate = async (templateData) => {
    return await Template.create(templateData);
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

exports.updateTemplate = async (id, updateData) => {
    let template = await Template.findByPk(id);
    if (!template) throw new Error('Template not found');

    await template.update(updateData);
    return template;
};

exports.deleteTemplate = async (id) => {
    const template = await Template.findByPk(id);
    if (!template) {
        throw new Error('Template not found');
    }
    await template.destroy();
};