const multer = require("multer");
const AppError = require("../errors/AppError");

const MULTER_ERROR_MESSAGES = {
  LIMIT_FILE_SIZE: "File size exceeds the 5 MB limit.",
  LIMIT_FILE_COUNT: "Too many files uploaded.",
  LIMIT_FIELD_KEY: "Upload field name is too long.",
  LIMIT_FIELD_VALUE: "Upload field value is too long.",
  LIMIT_FIELD_COUNT: "Too many upload fields.",
  LIMIT_PART_COUNT: "Too many parts in the upload.",
  LIMIT_UNEXPECTED_FILE: "Unexpected file field in upload.",
};

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof multer.MulterError) {
    const message =
      MULTER_ERROR_MESSAGES[err.code] || "File upload error.";
    return res.status(413).json({
      success: false,
      error: { code: "FILE_UPLOAD_ERROR", message },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
}

module.exports = errorHandler;