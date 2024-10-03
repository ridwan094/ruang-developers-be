const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/templates', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnails', maxCount: 10 }]), templateController.createTemplate);
router.get('/templates', templateController.getAllTemplates);
router.get('/templates/:id', templateController.getTemplateDetails);
router.put('/templates/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnails', maxCount: 10 }]), templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);

module.exports = router;
