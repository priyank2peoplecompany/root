const common = require('../../helpers/common.helper');
/**
 * @api {post} /gym/create Create Gym
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Gym
 * @apiGroup Gym
 * @apiParam {string}   title               Gym Name
 * @apiParam {string}   description         Gym Description 
 * @apiParam {integer}  phone               Gym Phone Number
 * @apiParam {array}    amenities           Gym Amenities
 * @apiParam {array}    services            Gym Services
 * @apiParam {array}    machinaries         Gym Machinaries 
 * @apiParam {array}    gym_fees            Gym Fees  [{days : 0 ,fees : 0},{days : 7,fees : 250},{days : 14,fees : 2500},{days : 28,fees : 5000 }] 
 * @apiParam {json}     working_time        Gym Working Time
 * @apiParam {json}     address             Gym Address (Sample Json)  {"place_id": "qwerty123","full_address": "Corporate House, 1,Sigma, Bodakdev, Ahmedabad, Gujarat 380054","formatted_address": "Corporate House, 1,Sigma, Bodakdev","area": "Ishanpur","city": "Ahmedabad","state": "Gujarat","country": "INDIA","pincode": " 380054","location": {"type" : "Point","coordinates”:[longitude, latitude]}}
 * @apiParam {string}   [email]             Gym Email
 * @apiParam {string}   [siteurl]           Gym Website Url
 * @apiParam {string}   [logo]              Gym Logo
 * @apiParam {string}   [banner]            Gym Banner Image
 * @apiParam {array}    [gym_photos]        Gym Photo ( Array of Photos)
 * @apiParam {array}    [gym_videos]        Gym Video ( Array of Videos) 
 * @apiParam {boolean}  [is_verified]       True/False ( Default False)
 * @apiParam {integer}  [status]            Status (0 = Pending , 1=Approved , 2 = Disapproved , Default : 0 ) 
 */
exports.CreateGym = (req, res) => {
    let required_fields = {
        'title': 'string',
        'phone': 'string',
        'description': 'string',
        'address': 'json',
        'working_time': 'json',
        'gym_fees': 'array',
        'amenities': 'array',
        'machinaries': 'array',
        'services': 'array',
        'email': 'optional|string',
        'siteurl': 'optional|string',
        'logo': 'optional|string',
        'banner': 'optional|string',
        'is_verified': 'optional|boolean',
        'status': 'optional|integer'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        gymdata(params, 'create', res, req);
    }
}

/**
 * @api {post} /gym/update Update Gym
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Gym
 * @apiGroup Gym
 * @apiParam {string}   id                      Gym Id
 * @apiParam {string}   title                   Gym Name
 * @apiParam {string}   description             Gym Description 
 * @apiParam {integer}  phone                   Gym Phone Number
 * @apiParam {json}     address                 Gym Address (Sample Json) {"place_id": "qwerty123","full_address": "Corporate House, 1,Sigma, Bodakdev, Ahmedabad, Gujarat 380054","formatted_address": "Corporate House, 1,Sigma, Bodakdev","area": "Ishanpur","city": "Ahmedabad","state": "Gujarat","country": "INDIA","pincode": " 380054","location": {"type" : "Point","coordinates”:[longitude, latitude]}}
 * @apiParam {json}     working_time            Gym Working Time
 * @apiParam {array}    amenities               Gym Amenities
 * @apiParam {array}    services                Gym Services
 * @apiParam {array}    machinaries             Gym Machinaries 
 * @apiParam {array}    gym_fees                Gym Fees  [{days : 0 ,fees : 0},{days : 7,fees : 250},{days : 14,fees : 2500},{days : 28,fees : 5000 }]
 * @apiParam {string}   [email]                 Gym Email
 * @apiParam {string}   [siteurl]               Gym Website Url
 * @apiParam {string}   [logo]                  Gym Logo
 * @apiParam {string}   [banner]                Gym Banner Image 
 * @apiParam {string}   [new_logo]              Gym New Logo
 * @apiParam {string}   [new_banner]            Gym New Banner Image
 * @apiParam {array}    [gym_photos]            Gym Photo ( Array of Photos)
 * @apiParam {array}    [removed_gym_photos]    Removed Photo ( Array of Photos)
 * @apiParam {array}    [new_gym_photos]        New Photo ( Array of Photos)
 * @apiParam {array}    [gym_videos]            Gym Video ( Array of Videos) 
 * @apiParam {array}    [removed_gym_videos]    Removed Photo ( Array of Photos)
 * @apiParam {array}    [new_gym_videos]        New Photo ( Array of Photos)
 * @apiParam {boolean}  [is_verified]           True/False ( Default False) 
 * @apiParam {integer}  [status]                Status (0 = Pending , 1=Approved , 2 = Disapproved , Default : 0 ) 
 */
exports.UpdateGym = (req, res) => {
    let required_fields = {
        'id': 'string',
        'title': 'string',
        'phone': 'string',
        'description': 'string',
        'address': 'json',
        'working_time': 'json',
        'gym_fees': 'array',
        'amenities': 'array',
        'machinaries': 'array',
        'services': 'array',
        'email': 'optional|string',
        'siteurl': 'optional|string',
        'logo': 'optional|string',
        'banner': 'optional|string',
        'is_verified': 'optional|boolean',
        'status': 'optional|integer'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        gymdata(params, 'update', res, req);
    }
}

/**
 * @api {post} /gym/list List All Gym
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Gym
 * @apiGroup Gym
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  lat         Latitude
 * @apiParam {integer}  long        Longitude
 * @apiParam {string}   city        City Name
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( ascend or descend )
 * @apiParam {string}   orderby     Order By ( Field Name : title,_id,created_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By title )
 */
exports.ListGym = (req, res) => {

    //let day = common.getDayName();
    // let d = new Date();
    // let n = d.getTime();
    // console.log("time=======>", n);
    // let fieldname = `working_time.${day}`;
    // model.Gym.find({
    //     [fieldname]: {
    //         $elemMatch: {
    //             opened: { $lte: n },
    //             closed: { $gte: n }
    //         }
    //     }
    // }).exec((err, data) => {
    //     if (err) cres.error(res, err, {});
    //     else {
    //         if (data.length > 0) console.log('DATA=======>', data)
    //         else console.log("No record found");
    //     }
    // });

    let required_fields = { page: 'integer', limit: 'integer', sort: 'string', lat: 'float', long: 'float', city: 'string', orderby: 'string' }
    let params = req.body
    if (vh.validate(res, required_fields, params)) {

        let orderbyfield = params.orderby;
        orderbyfield = 'distance';
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        //sortby = {};
        let condition = {};
        if (params.search != "" && params.search != undefined) condition = { $or: [{ 'title': { '$regex': new RegExp("^" + params.search, "i") } }, { 'description': { '$regex': new RegExp("^" + params.search, "i") } }] }
        if (params.services != "" && params.services != undefined) condition['services'] = { $in: params.services }
        //if (req.user.user_type != 'admin') condition['user_id'] = mongoose.Types.ObjectId(req.user._id);

        model.Gym.countDocuments(condition).then(data => {

            if (data > 0) {
                let page = params.page;
                let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                let returndata = { totalrecord: data }
                let sortby_field = '';
                if (params.sortby != 'Distance') {
                    sortby_field = {
                        $geoNear: { near: { type: "Point", coordinates: [params.long, params.lat] }, distanceField: "distance", distanceMultiplier: 0.001, spherical: true }
                    }
                }

                model.Gym.aggregate([sortby_field])
                    // .lookup({
                    //     from: "amenities", let: { amenities: "$amenities" },
                    //     pipeline: [{ $match: { $expr: { $and: [{ $in: ["$_id", "$$amenities"] }, { $eq: ["$enabled", true] }] } } }, { $project: { title: 1, _id: 1 } }],
                    //     as: "amenities"
                    // })
                    // .lookup({
                    //     from: "machines", let: { machinaries: "$machinaries" },
                    //     pipeline: [{ $match: { $expr: { $and: [{ $in: ["$_id", "$$machinaries"] }, { $eq: ["$enabled", true] }] } } }, { $project: { title: 1, _id: 1 } }],
                    //     as: "machinaries"
                    // })
                    .lookup({
                        from: "services", let: { services: "$services" },
                        pipeline: [{ $match: { $expr: { $and: [{ $in: ["$_id", "$$services"] }, { $eq: ["$enabled", true] }] } } }, { $project: { title: 1, _id: 1 } }],
                        as: "services"
                    })
                    .project({
                        _id: 1, title: 1, description: 1, logo: 1, banner: 1, rating: 1, gym_fees: 1, is_free_days: 1, services: 1, is_verified: 1, created_at: 1, distance: 1, address: 1

                    })
                    .sort(sortby)
                    .skip(skip)
                    .then(gymdata => {
                        if (gymdata.length > 0) {
                            returndata['gymdata'] = gymdata;
                            cres.send(res, returndata, 'Gym List')
                        }
                        else cres.send(res, [], 'No record found')
                    }).catch(function (err) {
                        cres.error(res, "Error", err);
                    });
            }
            else cres.send(res, [], 'No record found');
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

/**
* @api {post} /gym/details Gym Details
* @apiHeader {Authorization} Authorization Users unique access-key.
* @apiName Gym Details
* @apiGroup Gym
* @apiParam {string}   id      Gym Id
*/
exports.GymDetails = (req, res) => {
    let required_fields = { id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = { _id: mongoose.Types.ObjectId(params.id) };
        model.Gym.findOne(condition).
            populate({ path: 'amenities', match: { enabled: true }, select: { _id: 1, title: 1 } }).
            populate({ path: 'machinaries', match: { enabled: true }, select: { _id: 1, title: 1 } }).
            populate({ path: 'services', match: { enabled: true }, select: { _id: 1, title: 1 } }).
            populate({ path: 'ratings', match: { type: 0 }, select: { _id: 1, message: 1, rating: 1, created_at: 1, user_id: 1 }, populate: { path: 'rating_by', select: { _id: 1, name: 1 } } }).
            then(gymdata => {
                if (gymdata) cres.send(res, gymdata, 'Gym Details')
                else cres.send(res, [], 'No record found')
            }).catch(function (err) {
                cres.error(res, "Error", err);
            });
    }
}

/**
 * @api {get} /gym/facilities Get Facilities
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Get Facilities
 * @apiGroup Gym
 */
exports.getFacilities = async (req, res) => {
    let returndata = {
        amenities: await getAmenitites(),
        machinaries: await getMachinaries(),
        serivces: await getServices()
    };
    if (returndata) cres.send(res, returndata, "Facilities List");
    else cres.error(res, 'No record found', {});
}


async function getServices() {
    return model.Service.find({ enabled: true })
}

async function getAmenitites() {
    return model.Amenity.find({ enabled: true })
}

async function getMachinaries() {
    return model.Machine.find({ enabled: true })
}

function gymdata(params, action, res, req) {

    let gym_photos = [];
    let gym_videos = [];



    params['is_free_days'] = false;
    let freedays = params.gym_fees.filter(element => element.fees == 0);
    if (freedays.length > 0 && freedays[0].days > 0) params['is_free_days'] = true;

    params['gym_photos'] = gym_photos;
    params['gym_videos'] = gym_videos;
    params['user_id'] = req.user._id;

    if (action == 'create') {
        params['logo'] = common.moveFile(params.logo, 'gym');
        params['banner'] = common.moveFile(params.banner, 'gym');
        params['gym_photos'] = common.moveFiles(params.gym_photos, 'gym');
        params['gym_videos'] = common.moveFiles(params.gym_videos, 'gym');

        model.Gym.create(params).then(function (gymdata) {
            cres.send(res, gymdata, "Gym created successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
    else if (action == 'update') {

        params['logo'] = common.moveFile(params.new_logo, 'gym');
        params['banner'] = common.moveFile(params.new_banner, 'gym');

        params.gym_photos = common.moveFiles(params.gym_photos, params.new_gym_photos, 'gym', params.removed_gym_photos);
        params.gym_videos = common.moveFiles(params.gym_videos, params.new_gym_videos, 'gym', params.removed_gym_videos);

        model.Gym.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, { $set: params }).then(function (gymdata) {
            cres.send(res, gymdata, "Gym updated successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}