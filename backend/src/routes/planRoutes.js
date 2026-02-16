const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', planController.createPlan);
router.get('/', planController.getAllPlans);
router.get('/product/:productId', planController.getPlansByProduct);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
