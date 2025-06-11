// This middleware handles requests for routes that do not exist.
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // This passes the error to the next middleware in line (our main error handler)
};

// This is our main, custom error-handling middleware.
// It will catch any error that occurs in any route.
const errorHandler = (err, req, res, next) => {
    // If the status code is 200 (OK), it means an error was thrown
    // but the status code wasn't changed. We set it to 500 (Server Error).
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose specific errors (e.g., bad ObjectId format)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }
    
    // Mongoose duplicate key error (e.g., registering with an email that already exists)
    // Note: The authController handles this specifically, but this is a good general catch-all.
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue);
        message = `Duplicate field value entered: ${field}. Please use another value.`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        // Combine all validation error messages into one string
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    res.status(statusCode).json({
        message: message,
        // In development mode, we can also send the error stack for easier debugging.
        // In production, we don't want to expose this information.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };