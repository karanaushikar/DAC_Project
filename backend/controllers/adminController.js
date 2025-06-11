const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.getUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
};

exports.updateUserStatus = async (req, res) => {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        const wasPending = user.status === 'pending';
        user.status = status;
        const updatedUser = await user.save();

        if (wasPending && updatedUser.status === 'approved') {
            try {
                const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
                const message = `
                    <h2>Welcome to NewsFlow DAM!</h2>
                    <p>Hello ${user.name},</p>
                    <p>Your account has been approved. You can now log in:</p>
                    <a href="${loginUrl}">Login Now</a>
                `;
                await sendEmail({
                    email: user.email,
                    subject: 'Your Account Has Been Approved',
                    html: message
                });
            } catch (error) {
                console.error('Email failed to send:', error);
            }
        }
        res.json(updatedUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};