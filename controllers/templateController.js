const templateService = require('../services/templateService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

exports.createTemplate = async (req, res) => {
    try {
        const { template_name, publisher, id_template } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'File is required' });

        const template = await templateService.createTemplate({ template_name, publisher, id_template }, file);
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
        const template = await templateService.getTemplateDetails(req.params.id);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { template_name, publisher, id_template } = req.body;
        const newFile = req.file;

        const updatedTemplate = await templateService.updateTemplate(id, { template_name, publisher, id_template }, newFile);

        res.status(200).json(updatedTemplate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const templateId = req.params.id;
        await templateService.deleteTemplate(templateId);
        return res.status(200).json({ message: 'Template successfully deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
