const common = require('../../helpers/common.helper');
require('dotenv-expand')(require('dotenv').config());
const upload = require('../../helpers/image-upload.helper').imgFileUpload;

/**
 * @api {post} /category/add Add Category
 * @apiName Add New Category
 * @apiGroup Category
 * @apiParam {string}   name            Category Name
 * @apiParam {array}    images          Category Images   
 * @apiParam {string}   parent_id       Parent Category   
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
                    console.log("params========>", children); 
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
 * @api {post} /user/update Update User 
 * @apiName Update User 
 * @apiGroup User
 * @apiParam {string}       email                   Email Address
 * @apiParam {string}       [icon]                  Icon
 * @apiParam {string}       [old_icon]              Old Icon
 * @apiParam {array}        category_ids            Category Ids 
 * @apiParam {string}       company                 Company Name
 * @apiParam {string}       [slogan]                Slogan
 * @apiParam {string}       [address]               Address
 * @apiParam {string}       [website]               Website
 * @apiParam {string}       [email]                 Email
 * @apiParam {array}        [socials]               Socials
 * @apiParam {array}        [products]              Products
 * @apiParam {array}        [photos]                Photos
 * @apiParam {array}        [old_photos]            Old Photos
 */
exports.UpdateUser = (req, res) => {
    let required_fields = {
        email: 'string',
        category_ids: 'array',
        icon: 'optional|string',
        old_icon: 'optional|string',
        company: 'company',
        slogan: 'optional|string',
        address: 'optional|integer',
        website: 'optional|string',
        products: 'optional|array',
        photos: 'optional|array',
        old_photos: 'optional|array'
    }

    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        let condition = { _id: mongoose.Types.ObjectId(req.user._id) }
        this.getUserDetail(condition).then(data => {
            if (data && data._id) {
                params['icon'] = common.moveFile(params.icon, 'user', params.old_icon);
                model.User.updateOne({ _id: mongoose.Types.ObjectId(data._id) }, { $set: params }).then(function (udata) {
                    if (params.icon != undefined && params.icon != '') {
                        params['icon'] = `${process.env.ASSETS_URL}uploads/${params['icon']}`;
                    }
                    params['_id'] = req.user._id;
                    cres.send(res, params, "User updated successfully");
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, "Error", {});
                });
            }
            else cres.send(res, {}, 'Error in updating user profile')
        }).catch(err => {
            cres.error(res);
        });
    }
}


/**
 * @api {post} /user/list List User
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All User
 * @apiGroup User
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListUser = (req, res) => {
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
        model.User.countDocuments(condition).exec((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data > 0) {
                    let page = params.page;
                    let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                    let returndata = { totalrecord: data }
                    model.User.find(condition).sort(sortby).skip(skip).limit(params.limit).lean().then(userdata => {
                        if (userdata.length > 0) {
                            returndata['userdata'] = userdata;
                            cres.send(res, returndata, 'User List')
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
    return model.Category.findOne(condition)
        .select('-created_at -updated_at -deleted')
        .lean({ getters: true });
}