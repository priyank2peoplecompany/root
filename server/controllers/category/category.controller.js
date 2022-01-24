const common = require('../../helpers/common.helper');
require('dotenv-expand')(require('dotenv').config());
const upload = require('../../helpers/image-upload.helper').imgFileUpload;

/**
 * @api {post} /category/add Add Category
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add New Category
 * @apiGroup Category
 * @apiParam {string}   name            Category Name
 * @apiParam {array}    images          Category Images   
 * @apiParam {string}   [parent_id]     Parent Category ( pass parent_id when you have create sub category)  
 */
exports.addCategory = (req, res) => {
    let required_fields = { name: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = { $or: [ { name: params.name }, { 'children.name': params.name } ] }
        this.getCategoryDetail(condition).then(categoryData => {
            // 1. Check if user is registered or not
            if (categoryData) {
                cres.send(res, {}, 'Category name already exists');
            } else {
                //params.videos = common.moveFiles(params.videos, params.new_videos, 'community', params.removed_videos);    
                params['images'] = common.moveFiles([],params.images, 'category');
                if(!params.parent_id){
                    model.Category.create(params).then(function (udata) {
                        cres.send(res, udata, "Category added successfully");
                    }).catch(function (err) {
                        console.log("Error==>", err);
                        cres.error(res, "Error", {});
                    });
                }
                else{
                    let children = [{ images: params.images , name: params.name }];
                    model.Category.updateOne({ _id: mongoose.Types.ObjectId(params.parent_id) },{ $push: { "children": { $each: children } } }).then(function (udata) {
                        cres.send(res, udata, "Category added successfully");
                    }).catch(function (err) {
                        console.log("Error==>", err);
                        cres.error(res, "Error", {});
                    });
                }
            }
        });
    }
}

/**
 * @api {post} /category/list List Category
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Category
 * @apiGroup Category
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListCategory = (req, res) => {
    let required_fields = { page: 'integer', limit: 'integer', sort: 'string', orderby: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let orderbyfield = params.orderby;
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        let condition = {};
        if (params.search != "" && params.search != undefined) {
            let searchtxt = params.search;
            condition['name'] = { '$regex': new RegExp("^" + searchtxt, "i") };
        }
        model.Category.countDocuments(condition).exec((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data > 0) {
                    let page = params.page;
                    let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                    let returndata = { totalrecord: data }
                    model.Category.find(condition).sort(sortby).skip(skip).limit(params.limit).lean().then(categorydata => {
                        if (categorydata.length > 0) {
                            returndata['categorydata'] = categorydata;
                            cres.send(res, returndata, 'Category List')
                        }
                        else cres.send(res, [], 'No record found');
                    }).catch(err => {
                        cres.error(res, err, {});
                    });
                }
                else cres.send(res, [], 'No record found')
            }
        });
    }
}

/**
 * Get the detail of given Phone Number 
 */
 exports.getCategoryDetail = (condition) => {
    return model.Category.findOne(condition).select('_id name').lean({ getters: true });
}