const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', serverController.getAllServers);
router.post('/', serverController.createServer);
router.put('/:id', serverController.updateServer);
router.delete('/:id', serverController.deleteServer);

module.exports = router;
