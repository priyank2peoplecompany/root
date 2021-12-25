const common = require('../../helpers/common.helper');
/**
 * @api {post} /machine/create Create Machine
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Machine
 * @apiGroup Machine
 * @apiParam {string} title             Title
 * @apiParam {string} enabled           True,False
 * @apiParam {string} [image]           Image
 * @apiParam {string} [description]     Description
 */
exports.CreateMachine = (req, res) => {
    let required_fields = { title: 'string', enabled: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let titlecode = common.UniqueName(params.title)
        params['title_code'] = titlecode;
        params['image'] = common.moveFile(params.image, 'machine');
        model.Machine.create(params).then(udata => {
            cres.send(res, udata, "Machine created successfully");
        }).catch(function (err) {
            console.log("Error==>", err);
            cres.error(res, "Error in creating machine", err);
        });
    }
}

/**
 * @api {post} /machine/update Update Machine
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName  Update Machine
 * @apiGroup Machine
 * @apiParam {string} id                Machine Id
 * @apiParam {string} title             Title
 * @apiParam {string} enabled           True,False
 * @apiParam {string} [image]           Image
 * @apiParam {string} [description]     Description
 */
exports.UpdateMachine = (req, res) => {
    let required_fields = { title: 'string', id: 'string', enabled: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['image'] = common.moveFile(params.new_image, 'machine', params.image);
        params['title_code'] = common.UniqueName(params.title);
        model.Machine.updateOne({ _id: machinedata._id }, { $set: params }).then(data => {
            cres.send(res, data, "Machine details updated successfully");
        }).catch(function (err) {
            let msg = 'Error in updating machine details'
            if (err.name === 'MongoError' && err.code === 11000) msg = 'Machine title is already exists';
            cres.error(res, msg, err);
        });
    }
}

/**
 * @api {post} /machine/list List Machine
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Machine
 * @apiGroup Machine
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,title,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListMachine = (req, res) => {
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
        model.Machine.countDocuments(condition).then(data => {
            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                model.Machine.find(condition).sort(sortby).skip(skip).limit(params.limit).then(machinedata => {
                    if (machinedata.length > 0) {
                        returndata['machinedata'] = machinedata;
                        cres.send(res, returndata, 'Machine List')
                    }
                    else cres.send(res, [], 'No record found')
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, err, {});
                });
            }
            else cres.send(res, [], 'No record found')
        }).catch(function (err) {
            console.log("Error==>", err);
            cres.error(res, err, {});
        });
    }
}