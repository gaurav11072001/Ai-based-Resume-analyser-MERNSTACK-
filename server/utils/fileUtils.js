const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
exports.extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if file exists, false otherwise
 */
exports.fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * Delete a file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if deletion was successful, false otherwise
 */
exports.deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human-readable file size
 */
exports.getReadableFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} - File extension
 */
exports.getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 */
exports.ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
