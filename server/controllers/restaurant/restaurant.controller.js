const common = require('../../helpers/common.helper');
/**
 * @api {post} /restaurant/create Create Restaurant
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Restaurant
 * @apiGroup Restaurant
 * @apiParam {string}   name                Restaurant Name
 * @apiParam {string}   [description]       Restaurant Description 
 * @apiParam {string}   [logo]              Restaurant Logo
 * @apiParam {string}   [cover_image]       Restaurant Cover Image
 * @apiParam {json}     [location]          Restaurant Address (Pass Json)
 * @apiParam {json}     [working_hours]     Restaurant Working Time
 * @apiParam {boolean}  [pure_veg]         True/False ( Default False)
 * @apiParam {boolean}  [available]        True/False ( Default False)
 */
exports.CreateRestaurant = (req, res) => {
    let required_fields = {
        'name': 'string',
        'description': 'string|optional',
        'logo': 'string|optional',
        'cover_image': 'string|optional',
        'location': 'json|optional',
        // 'working_hours': 'array|optional',
        'pure_veg': 'boolean|optional',
        'available': 'boolean|optional'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        restaurantdata(params, 'create', res, req);
    }
}

/**
 * @api {post} /restaurant/update Update Restaurant
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Restaurant
 * @apiGroup Restaurant
 * @apiParam {string}   id                  Restaurant Id
 * @apiParam {string}   [name]              Restaurant Name
 * @apiParam {string}   [description]       Restaurant Description
 * @apiParam {string}   [logo]              Restaurant Logo
 * @apiParam {string}   [cover_image]       Restaurant Cover Image
 * @apiParam {string}   [new_logo]          New Restaurant Logo
 * @apiParam {string}   [new_cover_image]   New Restaurant Cover Image
 * @apiParam {json}     [location]          Restaurant Address (Pass Json)
 * @apiParam {json}     [working_hours]     Restaurant Working Time
 * @apiParam {boolean}  [pure_veg]          True/False ( Default False)
 * @apiParam {boolean}  [available]         True/False ( Default False)
 */
exports.UpdateRestaurant = (req, res) => {
    let required_fields = {
        'name': 'string',
        'description': 'string|optional',
        'logo': 'string|optional',
        'cover_image': 'string|optional',
        'new_logo': 'string|optional',
        'new_cover_image': 'string|optional',
        'location': 'json|optional',
        // 'working_hours': 'array|optional',
        'pure_veg': 'boolean|optional',
        'available': 'boolean|optional'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Restaurant.countDocuments({ _id: mongoose.Types.ObjectId(params.id) }).then((err, cnt) => {
            if (err) cres.error(res, err, {});
            else {
                if (cnt <= 0) cres.error(res, 'Restaurant id is not available', {});
                else restaurantdata(params, 'update', res, req);
            }
        });
    }
}

/**
 * @api {post} /restaurant/availability Update Restaurant Availibility
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Restaurant Availibility
 * @apiGroup Restaurant
 * @apiParam {string}   id               Restaurant Id
 * @apiParam {boolean}  available        True/False ( Default False)
 */
exports.UpdateRestaurantAvailability = (req, res) => {
    let required_fields = {
        'id': 'string',
        'available': 'boolean'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Restaurant.countDocuments({ _id: mongoose.Types.ObjectId(params.id) }).then((err, cnt) => {
            if (err) cres.error(res, err, {});
            else {
                if (cnt <= 0) cres.error(res, 'Restaurant id is not available', {});
                else restaurantdata(params, 'update', res, req);
            }
        });
    }
}


/**
 * @api {post} /restaurant/list List Restaurant
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Restaurant
 * @apiGroup Restaurant
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : title,_id,created_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By title )
 */
exports.ListRestaurant = (req, res) => {
    let required_fields = { page: 'integer', limit: 'integer', sort: 'string', orderby: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        console.log("PARAMS===============>", params);

        let orderbyfield = params.orderby;
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        let condition = {};

        if (params.search != "" && params.search != undefined) {
            let searchtxt = params.search;
            condition = { $and: [{ $or: [{ 'name': { '$regex': new RegExp("^" + searchtxt, "i") } }, { 'description': { '$regex': new RegExp("^" + searchtxt, "i") } }] }] }
        }

        model.Restaurant.countDocuments(condition).then(data => {
            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                model.Restaurant.find(condition).
                    populate({ path: 'created_by', select: { _id: 1, name: 1 } }).
                    sort(sortby).
                    skip(skip).
                    limit(params.limit).
                    then(restaurantdata => {
                        if (restaurantdata.length > 0) {
                            returndata['restaurantdata'] = restaurantdata;
                            cres.send(res, returndata, 'Restaurant List')
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

function restaurantdata(params, action, res, req) {

    params['location'] = params.location;
    params['working_hours'] = params.working_hours;
    params['user_id'] = req.user._id;

    if (action == 'create') {
        params['logo'] = common.moveFile(params.logo, 'restaurant');
        params['cover_image'] = common.moveFile(params.cover_image, 'restaurant');
        model.Restaurant.create(params).then(function (restaurantdata) {
            cres.send(res, restaurantdata, "Restaurant created successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
    else if (action == 'update') {
        params['cover_image'] = common.moveFile(params.new_cover_image, 'restaurant', params.cover_image);
        params['logo'] = common.moveFile(params.new_logo, 'restaurant', params.logo);
        model.Restaurant.updateOne({ _id: mongoose.Types.ObjectId(params.id), user_id: mongoose.Types.ObjectId(req.user._id) }, { $set: params }).then(function (restaurantdata) {
            cres.send(res, restaurantdata, "Restaurant updated successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /restaurant/details Restaurant Details
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Restaurant Details
 * @apiParam {string}   restaurant_id     Restaurant id
 * @apiGroup Restaurant
 */
exports.RestaurantDetails = (req, res) => {
    let required_fields = { restaurant_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Restaurant.findById(mongoose.Types.ObjectId(params.restaurant_id)).
            populate({ path: 'created_by', select: { _id: 1, name: 1 } }).
            populate({ path: 'items', select: { _id: 1, name: 1, image: 1 } }).
            then(restaurantdata => {
                if (err) cres.error(res, err, {});
                else {
                    if (restaurantdata) cres.send(res, restaurantdata, 'Restaurant Details')
                    else cres.send(res, [], 'No record found')
                }
            }).catch(function (err) {
                cres.error(res, "Error", err);
            });
    }
}