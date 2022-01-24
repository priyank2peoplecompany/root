const common = require('../../helpers/common.helper');
/**
 * @api {post} /design/add Add Design
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add New Design
 * @apiGroup Category
 * @apiParam {string}   title           Image Name
 * @apiParam {string}   image           Design Image   
 * @apiParam {string}   category_id     Category Id
 * @apiParam {string}   html            Html of design 
 * @apiParam {boolean}  is_video        Is Video ? ( True or false)
 * @apiParam {string}   language        Language ( 'Gujarati', 'Hindi', 'English' )  passs any one 
 */
exports.addDesign = (req, res) => {
    let required_fields = { title: 'string', image: 'string',category_id: 'string', html: 'string', is_video: 'string', language: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let image = params.image;
        params['image'] = common.moveFile(image, 'design');        
        if(params['image'] != ''){
            params['thumb_image'] = common.resizeImage(image,'design',100,100);
        }
        model.Design.create(params).then(function (udata) {
            cres.send(res, udata, "Design added successfully");
        }).catch(function (err) {
            console.log("Error==>", err);
            cres.error(res, "Error in adding desig", {});
        });
    }
}