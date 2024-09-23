const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fileService = require('../services/fileService');
const fs = require('fs-extra');
const path = require('path');


exports.uploadFile = async (req, res) => {
    try {
        const { title, author, description, status } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploadedFile = await fileService.uploadFile({ title, author, description, status }, file);
        res.status(201).json(uploadedFile);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllFiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await fileService.getAllFiles(page, limit);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
};

exports.getFileById = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file) return res.status(404).json({ error: 'File not found' });
        res.json(file);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const { title, author, description, status } = req.body;
        const file = req.file;

        const updatedFile = await fileService.updateFile(fileId, { title, author, description, status }, file);

        return res.status(200).json(updatedFile);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;

        await fileService.deleteFile(fileId);

        return res.status(200).json({ message: 'File berhasil dihapus' });
    } catch (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: err.message });
    }
};

exports.downloadFileById = async (req, res) => {
    try {
        const file = await fileService.getFileById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File tidak ditemukan' });
        }

        if (file.status === 'inactive') {
            return res.status(403).json({ message: 'File tidak aktif dan tidak bisa diunduh.' });
        }

        const fileNameInMinio = decodeURIComponent(file.url_minio_files.split('/').pop());

        const sanitizedFileName = fileNameInMinio.replace(/^\d+-/, '');

        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const tempDir = path.join(__dirname, '../temp');
        const tempFilePath = path.join(tempDir, sanitizedFileName);

        fs.ensureDirSync(tempDir);

        const fileStream = await fileService.getFileStream(file.url_minio_files);
        const writeStream = fs.createWriteStream(tempFilePath);

        fileStream.pipe(writeStream);
        fileStream.pipe(res);

        writeStream.on('finish', () => {
            console.log(`File disimpan sementara di: ${tempFilePath}`);
        });

    } catch (err) {
        console.error('Kesalahan saat mengunduh file:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getFilesByStatus = async (req, res) => {
    try {
        const { status, pageStart, sortBy, sortDirection } = req.body;
        const result = await fileService.getFilesByStatus(status, pageStart, sortBy, sortDirection);
        res.status(200).json(result);
    } catch (err) {
        console.error('Kesalahan saat mendapatkan file:', err);
        res.status(500).json({ error: err.message });
    }
};




