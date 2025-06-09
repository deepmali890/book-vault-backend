const multer = require("multer");

// Document types allowed (optional, if needed for PDFs or docs)
const docTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Use memory storage (required for Supabase)
const storage = multer.memoryStorage();

// Optional: You can define a custom fileFilter if needed
const fileFilter = (req, file, cb) => {
  // Example: block anything that’s not image/pdf/audio
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// ✅ Only BookVault-related file uploads (simplified)
const uploadFields = {
  bookVault: upload.fields([
    { name: "frontimg", maxCount: 1 },
    { name: "backimg", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
    { name: "audio", maxCount: 1 },
    { name: "multiAudio", maxCount: 5 },
  ]),
  categoryThumbnail: upload.single('thumbnail'),
  authorThumbnail: upload.single('thumbnail')
};

module.exports = uploadFields;
