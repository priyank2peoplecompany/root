const common = require('../../helpers/common.helper');
/**
 * @api {post} /restaurantitem/create Create Restaurant Item
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Restaurant Item
 * @apiGroup RestaurantItem
 * @apiParam {string}   name                Restaurant Item Name
 * @apiParam {string}   restaurant_id       Restaurant ID
 * @apiParam {string}   [description]       Restaurant Item Description 
 * @apiParam {array}    [ingredients]       Restaurant Item Ingredients (Pass Array)
 * @apiParam {string}   [image]             Restaurant Item Image
 * @apiParam {string}   [price]             Restaurant Item Price
 * @apiParam {json}     [preparation_time]  Restaurant Item Preparation Time
 * @apiParam {json}     [nutrition]         Restaurant Item Nutrition (Pass Json)
 * @apiParam {array}    [add_ons]           Restaurant Item Nutrition Addons (Pass Array)
 * @apiParam {boolean}  [veg]               True/False ( Default False)
 * @apiParam {boolean}  [available]         True/False ( Default False)
 */
exports.CreateRestaurantItem = (req, res) => {
    let required_fields = {
        'name': 'string',
        'restaurant_id': 'string',
        'description': 'string|optional',
        'ingredients': 'array|optional',
        'image': 'string|optional',
        'price': 'string|optional',
        'preparation_time': 'string|optional',
        'nutrition': 'json|optional',
        'add_ons': 'array|optional',
        'veg': 'boolean|optional',
        'available': 'boolean|optional'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        restaurantItemdata(params, 'create', res, req);
    }
}

/**
 * @api {post} /restaurantitem/update Update Restaurant
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Restaurant Item
 * @apiGroup RestaurantItem
 * @apiParam {string}   id                  Restaurant Id
 * @apiParam {string}   name                Restaurant Item Name
 * @apiParam {string}   [description]       Restaurant Item Description 
 * @apiParam {array}    [ingredients]       Restaurant Item Ingredients (Pass Array)
 * @apiParam {string}   [image]             Restaurant Item Image
 * @apiParam {string}   [price]             Restaurant Item Price
 * @apiParam {string}   [preparation_time]  Restaurant Item Preparation Time
 * @apiParam {json}     [nutrition]         Restaurant Item Nutrition (Pass Json)
 * @apiParam {array}    [add_ons]           Restaurant Item Nutrition Addons (Pass Array)
 * @apiParam {boolean}  [veg]               True/False ( Default False)
 * @apiParam {boolean}  [available]         True/False ( Default False)
 */
exports.UpdateRestaurantItem = (req, res) => {
    let required_fields = {
        'id': 'string',
        'name': 'string',
        'description': 'string|optional',
        'ingredients': 'array|optional',
        'image': 'string|optional',
        'price': 'string|optional',
        'preparation_time': 'string|optional',
        'nutrition': 'json|optional',
        'add_ons': 'array|optional',
        'veg': 'boolean|optional',
        'available': 'boolean|optional'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.RestaurantItem.countDocuments({ _id: mongoose.Types.ObjectId(params.id) }).then((err, cnt) => {
            if (err) cres.error(res, err, {});
            else {
                if (cnt <= 0) cres.error(res, 'Restaurant Item id is not available', {});
                else restaurantItemdata(params, 'update', res, req);
            }
        });
    }
}

/**
 * @api {post} /restaurantitem/availability Update Restaurant Availibility
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Restaurant Availibility
 * @apiGroup Restaurant
 * @apiParam {string}   id               Restaurant Id
 * @apiParam {boolean}  available        True/False ( Default False)
 */
exports.UpdateRestaurantItemAvailability = (req, res) => {
    let required_fields = {
        'id': 'string',
        'available': 'boolean'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.RestaurantItem.countDocuments({ _id: mongoose.Types.ObjectId(params.id) }).then((err, cnt) => {
            if (err) cres.error(res, err, {});
            else {
                if (cnt <= 0) cres.error(res, 'Restaurant Item id is not available', {});
                else restaurantdata(params, 'update', res, req);
            }
        });
    }
}

/**
 * @api {post} /restaurantitem/details Restaurant Item Details
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Restaurant Item Details
 * @apiParam {string}   id               Restaurant Id
 * @apiGroup Restaurant
 */
exports.RestaurantItemDetails = async (req, res) => {
    let required_fields = { id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.RestaurantItem.findById(mongoose.Types.ObjectId(params.id)).then(restaurantitemdata => {
            if (restaurantitemdata) cres.send(res, restaurantitemdata, "Rastaurant Item details");
            else cres.send(res, [], 'No record found')
        }).catch(err => {
            cres.err(res, err, {});
        });
    }
}

/**
 * @api {post} /restaurantitem/list List Restaurant Items
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Restaurant
 * @apiGroup Restaurant
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : title,_id,created_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By title )
 */
exports.ListRestaurantItem = (req, res) => {
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

        model.RestaurantItem.countDocuments(condition).then(data => {
            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                model.RestaurantItem.find(condition).
                    populate({ path: 'created_by', select: { _id: 1, name: 1 } }).
                    sort(sortby).
                    skip(skip).
                    limit(params.limit).
                    then(restaurantitemdata => {
                        if (restaurantitemdata.length > 0) {
                            returndata['restaurantitemdata'] = restaurantitemdata;
                            cres.send(res, returndata, 'Restaurant Item List')
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

function restaurantItemdata(params, action, res, req) {

    if (params.image != undefined && params.image != '') {
        let file = params.image;
        let dirname = `server/assets/uploads/restaurantitem/${file}`;
        common.ensureDirectoryExistence(dirname);
        common.tmpToOriginal(file, 'restaurantitem/');
        params['image'] = `restaurant/${file}`;
    }
    if (params.ingredients.length > 0) params['ingredients'] = params.ingredients;
    // if (params.nutrition != undefined) params['nutrition'] = JSON.parse(params.nutrition);
    if (params.add_ons.length > 0) params['add_ons'] = params.add_ons;

    params['user_id'] = req.user._id;

    if (action == 'create') {
        model.RestaurantItem.create(params).then(function (restaurantitemdata) {
            cres.send(res, restaurantitemdata, "Restaurant Item created successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
    else if (action == 'update') {
        model.RestaurantItem.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, { $set: params }).then(function (restaurantitemdata) {
            cres.send(res, restaurantitemdata, "Restaurant Item updated successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}