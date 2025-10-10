const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, listMyOrders, getMyOrder, getMyOrderStatus, streamOrderStatus } = require('../controllers/order.controller');

router.use(auth);

router.post('/', createOrder);
router.get('/', listMyOrders);
router.get('/:id', getMyOrder);
router.get('/:id/status', getMyOrderStatus);
router.get('/:id/stream', streamOrderStatus);

module.exports = router;