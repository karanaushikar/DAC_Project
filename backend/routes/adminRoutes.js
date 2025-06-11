const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id/status').put(protect, admin, updateUserStatus);

module.exports = router;