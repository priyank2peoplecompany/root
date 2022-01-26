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
 * @apiParam {boolean}  child_category  Is Child category  ? ( True or false)
 * @apiParam {string}   language        Language ( 'Gujarati', 'Hindi', 'English' )  passs any one 
 */
exports.addDesign = (req, res) => {
    let required_fields = { title: 'string', image: 'string',category_id: 'string', html: 'string', is_video: 'boolean', child_category: 'boolean', language: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let image = params.image;
        params['image'] = common.moveFile(image, 'design');        
        if(params['image'] != ''){
            params['thumb_image'] = common.resizeImage(image,'design',100,100);
        }
        let child_category = params.child_category;
        delete params.child_category;
        console.log(params);
        let design = [params]
        if(child_category == true){
            console.log("if=====");
            model.Category.updateOne({ 'children._id': mongoose.Types.ObjectId(params.category_id) },{ $push: { "children.$.design": { $each: design } } }).then(function (udata) {
                cres.send(res, params, "Design added successfully");
            }).catch(function (err) {
                console.log("Error==>", err);
                cres.error(res, "Error", {});
            });
        }
        else{
            console.log("else=====");
            model.Category.updateOne({ _id: mongoose.Types.ObjectId(params.category_id) },{ $push: { "design": { $each: design } } }).then(function (udata) {
                cres.send(res, params, "Design added successfully");
            }).catch(function (err) {
                console.log("Error==>", err);
                cres.error(res, "Error", {});
            });
        }
    }
}