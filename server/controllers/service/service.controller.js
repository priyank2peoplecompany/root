const common = require('../../helpers/common.helper');
/**
 * @api {post} /service/create Create Service 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Service 
 * @apiGroup Service
 * @apiParam {string} title             Title
 * @apiParam {boolean} enabled           True,False
 * @apiParam {string} [image]           Image
 * @apiParam {string} [description]     Description
 */
exports.CreateService = (req, res) => {
    let required_fields = { title: 'string', enabled: 'boolean' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let titlecode = common.UniqueName(params.title)
        params['title_code'] = titlecode;
        params['image'] = common.moveFile(params.image, 'service');
        model.Service.create(params).then(function (udata) {
            cres.send(res, udata, "Service created successfully");
        }).catch(function (err) {
            console.log("Error==>", err);
            cres.error(res, "Error in creating service", err);
        });

    }
}

/**
 * @api {post} /service/update Update Service
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Service
 * @apiGroup Service
 * @apiParam {string}   id                  Service Id
 * @apiParam {string}   title               Title
 * @apiParam {boolean}  enabled             True,False
 * @apiParam {string}   [image]             Image
 * @apiParam {string}   [new_image]         New Image
 * @apiParam {string}   [description]       Description
 */
exports.UpdateService = (req, res) => {
    let required_fields = { id: 'string', title: 'string', enabled: 'boolean' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['image'] = common.moveFile(params.new_image, 'service', params.image);
        params['title_code'] = common.UniqueName(params.title);
        model.Service.updateOne({ _id: servicedata._id }, { $set: params }).then(data => {
            cres.send(res, data, "Service updated successfully");
        }).catch(err => {
            let msg = 'Error in updating service details'
            if (err.name === 'MongoError' && err.code === 11000) msg = 'Service title is already exists';
            cres.error(res, msg, err);
        });
    }
}

/**
 * @api {post} /service/list List Service
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Service
 * @apiGroup Service
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,title,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListService = (req, res) => {
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
            condition = { $or: [{ title: new RegExp(searchtxt, 'i') }, { description: new RegExp(searchtxt, 'i') }] }
        }
        model.Service.countDocuments(condition).then(data => {
            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                model.Service.find(condition).sort(sortby).skip(skip).limit(params.limit).then(servicedata => {
                    if (servicedata.length > 0) {
                        returndata['servicedata'] = servicedata;
                        cres.send(res, returndata, 'Service List')
                    }
                    else cres.send(res, [], 'No record found')
                }).catch(err => {
                    cres.error(res, err, {});
                });
            }
            else cres.send(res, [], 'No record found')
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}