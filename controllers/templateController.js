const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const templateService = require('../services/templateService');

exports.createTemplate = async (req, res) => {
    try {
        const { template_name, publisher, id_template, description } = req.body;
        const file = req.files['file'] ? req.files['file'][0] : null;
        const thumbnails = req.files['thumbnails'] || [];

        if (!file) return res.status(400).json({ error: 'Main file is required' });

        const template = await templateService.createTemplate({ template_name, publisher, id_template, description }, file, thumbnails);
        res.status(201).json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTemplates = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const templates = await templateService.getAllTemplates(page, limit);
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};

exports.getTemplateDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await templateService.getTemplateByGenericId(id);
        res.status(200).json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { template_name, publisher, id_template, description } = req.body;
        const file = req.files['file'] ? req.files['file'][0] : null;
        const thumbnails = req.files['thumbnails'] || [];

        const updatedTemplate = await templateService.updateTemplate(id, { template_name, publisher, id_template, description }, file, thumbnails);

        const response = {
            id: updatedTemplate.id,
            template_name: updatedTemplate.template_name,
            publisher: updatedTemplate.publisher,
            id_template: updatedTemplate.id_template,
            url_minio_preview: updatedTemplate.url_minio_preview,
            url_minio_thumbnail: JSON.parse(updatedTemplate.url_minio_thumbnail),
            description: updatedTemplate.description
        };

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        const result = await templateService.deleteTemplate(templateId);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.downloadTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Mendapatkan stream file dari service
        const { fileName, fileStream, mimeType } = await templateService.downloadTemplateFile(id);

        // Mengirimkan file ke client
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', mimeType);
        fileStream.pipe(res); // Mengirimkan stream file sebagai response
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};