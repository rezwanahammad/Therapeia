const express = require('express')
const router = express.Router()
const { listAll, setStatus, setTracking, cancel, getAudit } = require('../controllers/adminOrders.controller')

router.get('/', listAll)
router.put('/:id/status', setStatus)
router.put('/:id/tracking', setTracking)
router.post('/:id/cancel', cancel)
router.get('/:id/audit', getAudit)

module.exports = router