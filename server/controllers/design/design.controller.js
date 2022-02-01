const common = require('../../helpers/common.helper');
require('dotenv-expand')(require('dotenv').config());
/**
 * @api {post} /design/add Add Design
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add New Design
 * @apiGroup Design
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
            model.Category.updateOne({ 'children._id': mongoose.Types.ObjectId(params.category_id) },{ $push: { "children.$.design": { $each: design } } }).then(function (udata) {
                cres.send(res, params, "Design added successfully");
            }).catch(function (err) {
                console.log("Error==>", err);
                cres.error(res, "Error", {});
            });
        }
        else{
            model.Category.updateOne({ _id: mongoose.Types.ObjectId(params.category_id) },{ $push: { "design": { $each: design } } }).then(function (udata) {
                cres.send(res, params, "Design added successfully");
            }).catch(function (err) {
                console.log("Error==>", err);
                cres.error(res, "Error", {});
            });
        }
    }
}

/**
 * @api {post} /design/updateHtml Update Design HTML
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add New Design
 * @apiGroup Design
 * @apiParam {string}   id              Design Id
 * @apiParam {boolean}  child_design    Is Child Design  ? ( True or false)
 */
 exports.getDesign = (req, res) => {
    let required_fields = { id: 'string', child_design: 'boolean' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let project={};
        let condition = { $or:[ {'design._id' : mongoose.Types.ObjectId(params.id)}, {'children.design':{"$elemMatch":{'_id':mongoose.Types.ObjectId(params.id)}}} ]}
        if(params.child_design){
            //condition = {'children.design':{"$elemMatch":{'_id':mongoose.Types.ObjectId(params.id)}}}
            project['children.design.html'] = 1;
        }
        else{
            //condition = {'design._id' : mongoose.Types.ObjectId(params.id)}
            project['design.html'] = 1;
        }

        model.Category.findOne(condition).select( project ).then(categorydata => {
            if (categorydata) {
                let returnData = {_id : categorydata._id};
                let html = '';
                if(params.child_design){
                    html = categorydata.children[0].design[0].html;
                }else{
                    html = categorydata.design[0].html;
                }
                //updateHTML(html,req.user);
                returnData['html'] = updateHTML(html,req.user);
                cres.send(res, returnData, 'Category Details')
            }
            else cres.send(res, [], 'No record found');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

function updateHTML(htmlStr,user){
    
    let newHtml = htmlStr.replace('#COMPANY#', user.company);
    newHtml = newHtml.replace('#PHONE#', user.phone);
    newHtml = newHtml.replace('#EMAIL#', user.email);
    newHtml = newHtml.replace('#ADDRESS#', user.address);
    newHtml = newHtml.replace('#WEBSITE#', user.website);
    
    // regex =  new RegExp(/<([^\s]+).*?class="logo".*?>(.+?)<\/\1>/gi);
    // matches = newHtml.match(regex);
    // console.log("matches=====",matches);

    // var elements = newHtml.getElementsByClassName('logo'); // or:
    // console.log("logo=========",elements);
    

    return newHtml;
}