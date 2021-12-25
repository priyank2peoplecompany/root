const common = require('../../helpers/common.helper');
/**
 * @api {post} /amenity/create Create Amenity 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Amenity
 * @apiGroup Amenity
 * @apiParam {string} title             Title
 * @apiParam {string} enabled           True,False
 * @apiParam {string} [image]           Image
 * @apiParam {string} [description]     Description
 */
exports.CreateAmenity = (req, res) => {
    let required_fields = { title: 'string', enabled: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let titlecode = common.UniqueName(params.title);
        params['title_code'] = titlecode;
        params['image'] = common.moveFile(params.image, 'amenity');

        model.Amenity.create(params).then(udata => {
            cres.send(res, udata, "Amenity created successfully");
        }).catch(function (err) {
            let msg = 'Error in creating amenity';
            if (err.name === 'MongoError' && err.code === 11000) msg = 'Amenity title is already exists';
            cres.error(res, msg, err);
        });

    }
}

/**
 * @api {post} /amenity/update Update Amenity 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Amenity
 * @apiGroup Amenity
 * @apiParam {string} id                Amenity Id
 * @apiParam {string} title             Title
 * @apiParam {string} enabled           True,False
 * @apiParam {string} [image]           Image
 * @apiParam {string} [new_image]       Old Image
 * @apiParam {string} [description]     Description
 */
exports.UpdateAmenity = (req, res) => {
    let required_fields = { id: 'string', title: 'string', enabled: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['image'] = common.moveFile(params.new_image, 'amenity', params.image);
        params['title_code'] = common.UniqueName(params.title);
        model.Amenity.updateOne({ _id: amenitydata._id }, { $set: params }).then(data => {
            cres.send(res, data, "Amenity details updated successfully");
        }).catch(function (err) {
            let msg = 'Error in updating amenity details'
            if (err.name === 'MongoError' && err.code === 11000) msg = 'Amenity title is already exists';
            cres.error(res, msg, err);
        });
    }
    else cres.error(res, "Please check your amenity id", {});
}

/**
 * @api {post} /amenity/list List Amenity
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Amenity
 * @apiGroup Amenity
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,title,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListAmenity = (req, res) => {
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
        model.Amenity.countDocuments(condition).then(data => {
            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                model.Amenity.find(condition).sort(sortby).skip(skip).limit(params.limit).then(amenitydata => {
                    if (amenitydata.length > 0) {
                        returndata['amenitydata'] = amenitydata;
                        cres.send(res, returndata, 'Amenity List')
                    }
                    else cres.send(res, [], 'No record found')
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, err, []);
                });
            }
            else cres.send(res, [], 'No record found')
        }).catch(function (err) {
            console.log("Error==>", err);
            cres.error(res, err, []);
        });
    }
}