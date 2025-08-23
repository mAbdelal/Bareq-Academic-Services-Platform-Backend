const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(path.dirname(uploadPath))) {
            fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});



const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only images, PDFs and Word documents are allowed'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;