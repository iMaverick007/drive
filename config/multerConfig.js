import multer from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed types are JPEG, PNG, and GIF.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

export default upload;