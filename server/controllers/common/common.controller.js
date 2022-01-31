const common = require('../../helpers/common.helper');
const upload = require('../../helpers/image-upload.helper').imgFileUpload;
require('dotenv-expand')(require('dotenv').config());

/**
 * @api {post} /file/upload Upload Files
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Upload Files
 * @apiGroup Common
 * @apiParam {Array}   files    Photo ( Array of Photos)
 */
exports.UploadFiles = (req, res) => {    
    upload(req, res).then(() => {
        console.log("herehrher");
        let filesdata = req.body.file;
        console.log("filesdata=====>",filesdata);
        if (filesdata.length > 0) cres.send(res, filesdata, "File upload successfully");
        else cres.error(res, 'Something went wrong', {});
    }).catch(err => {
        console.log("err=>",err);
        cres.error(res, 'Something11 went wrong', {});
    })
}

/**
 * @api {post} /html/upload    Upload HTML Files
 * @apiName Upload HTML images
 * @apiGroup Common
 * @apiParam {Array}   files    Photo ( Array of Photos)
 */
 exports.UploadHTMLFiles = (req, res) => {    
    upload(req, res).then(() => {
        let filesdata = req.body.file;
        if (filesdata.length > 0) {
            filesdata.map(file => {
                common.renameFile(file.filename, file.originalname);
                common.moveFile(file.originalname, 'html');
            });
            cres.send(res, filesdata, "File upload successfully");
        }
        else cres.error(res, 'Something went wrong', {});
    }).catch(err => {
        console.log("err=>",err);
        cres.error(res, 'Something went wrong', {});
    })
}