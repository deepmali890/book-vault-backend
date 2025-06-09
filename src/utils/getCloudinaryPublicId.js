const path = require('path');

const getCloudinaryPublicId = (url) => {
    try {
        if (!url) return null;

        const parts = url.split('/');
        const fileNameWithExt = parts.pop(); // e.g. img_abc123.jpg
        const fileName = path.parse(fileNameWithExt).name; // img_abc123

        // Find the folder path after 'upload' and ignore version number
        const uploadIndex = parts.findIndex(p => p === 'upload');
        const folderParts = parts.slice(uploadIndex + 2); // skip 'upload' and version (e.g. v1712345)
        const folderPath = folderParts.join('/'); // e.g. subcategories

        return `${folderPath}/${fileName}`; // subcategories/img_abc123
    } catch (error) {
        console.error("Error extracting Cloudinary public ID:", error);
        return null;
    }
};

module.exports = getCloudinaryPublicId;
