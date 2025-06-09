const multer = require('multer');

const storage = multer.memoryStorage();
const fileHandle = multer({ storage }).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'SubCategoryImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookPdf', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'sliderImage', maxCount: 1 }
]);

module.exports = fileHandle;
