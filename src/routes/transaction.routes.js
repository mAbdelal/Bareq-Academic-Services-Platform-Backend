const express = require('express');
const router = express.Router();

const {
    getUserTransactions,
    searchTransactions,
    getMyTransactions
} = require('../controllers/transaction.controller');

const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/search', authorize('show_transactions'), searchTransactions);

router.get('/my', getMyTransactions);

router.get('/:user_id', authorize('show_transactions'), getUserTransactions);


module.exports = router;


