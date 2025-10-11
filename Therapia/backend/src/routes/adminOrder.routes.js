const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { listOrders, updateOrderStatus, updateTracking, cancelOrder, getAudit, deleteOrder } = require('../controllers/adminOrder.controller');

router.use(adminAuth);

router.get('/', listOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/tracking', updateTracking);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/audit', getAudit);
router.delete('/:id', deleteOrder);

module.exports = router;