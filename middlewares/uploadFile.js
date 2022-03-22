const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads/projects'); // 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(' ', ''));
    },
});

const upload = multer({
    storage: storage,
});

module.exports = upload;