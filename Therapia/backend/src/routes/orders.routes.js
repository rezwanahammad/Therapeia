const express = require('express')
const router = express.Router()
const { createOrder, listMyOrders, getOrderById } = require('../controllers/orders.controller')

router.post('/', createOrder)
router.get('/', listMyOrders)
router.get('/:id', getOrderById)

module.exports = router