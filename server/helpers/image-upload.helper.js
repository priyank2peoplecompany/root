const multer = require('multer');

const imgFileOption = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'server/assets/tmp/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const imgFile = multer({
    storage: imgFileOption,
    fileFilter: function (req, file, cb) {
        cb(null, true)
    },
}).any();

exports.imgFileUpload = (req, res) => {
    return new Promise((resolve, reject) => {
        imgFile(req, res, function (err) {
            if (err) {
                console.log('err' + err);
                reject(err);
            } else {
                req.body.file = req.files ? req.files : "";
                resolve();
            }
        });
    });
}


