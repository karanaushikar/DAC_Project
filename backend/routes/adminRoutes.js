const express = require('express');
const router = express.Router();

// Step 1: Import the controller functions
const { 
    getUsers, 
    updateUserStatus 
} = require('../controllers/adminController');

// Step 2: Import the middleware functions
// We are using the ORIGINAL middleware file you gave me, 'authMiddleware.js'.
// It exports 'protect' and 'admin'.
const { 
    protect, 
    admin 
} = require('../middleware/authMiddleware');

// Step 3: Define the routes
// This route will get all users. It must be protected, and only an admin can access it.
router.get('/users', protect, admin, getUsers);

// This route will update a user's status. It must also be protected for admins only.
router.put('/users/:id/status', protect, admin, updateUserStatus);


// Step 4: Export the router
module.exports = router;