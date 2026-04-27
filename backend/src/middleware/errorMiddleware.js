export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  
  console.error('Backend Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
