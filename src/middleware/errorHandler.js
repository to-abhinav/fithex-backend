

const IS_PROD = process.env.NODE_ENV === "production";

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};


const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${err.message}`);
  if (!IS_PROD) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only expose stack trace in development
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
