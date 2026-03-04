const express = require('express');
const router = express.Router();
const apiKey = require('../middlewares/apiKey');
const upload = require('../middlewares/upload');
const uploadController = require('../controllers/uploadController');

router.post('/:type', apiKey, upload.single('image'), uploadController.uploadImage);
router.delete('/:type/:filename', apiKey, uploadController.deleteImage);

module.exports = router;
