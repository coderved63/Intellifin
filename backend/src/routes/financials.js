const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const auth = require('../middleware/auth');

// All financial data is read-only for authenticated users
router.get('/historical', auth, financialController.getHistoricalFinancials);
router.get('/valuation', auth, financialController.getValuationResults);
router.get('/assumptions', auth, financialController.getAssumptions);

module.exports = router;
