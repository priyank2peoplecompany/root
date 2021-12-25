const common = require('../../helpers/common.helper');
const ioh = require('../../helpers/socket.helper');
/**
 * @api {post} /rate/add Add Rate
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Rate
 * @apiGroup Rate
 * @apiParam {string}   title               Title
 * @apiParam {string}   [description]       Description
 * @apiParam {string}   [rate_photo]        Rate Photo 
 */
exports.AddRate = (req, res) => {
    const required_fields = { title: 'string', description: 'optional|string', rate_photo: 'optional|string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        AddUpdateRate(params, res, req, 'create');
    }
}

/**
 * @api {post} /rate/like/add Add Rate Star
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Rate Star
 * @apiGroup Rate
 * @apiParam {string}   rate_id     Rate id
 */
exports.addRateStar = (req, res) => {
    const required_fields = { rate_id: 'string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        const user_id = req.user._id;
        const user_ratings = { users: mongoose.Types.ObjectId(user_id), rate: params.rate }
        const condition = { $and: [{ _id: mongoose.Types.ObjectId(params.rate_id) }, { 'user_ratings.users': req.user._id }] };
        model.Rate.updateOne(condition, { $set: { user_ratings: user_ratings } }).then(ratedata => {
            if (ratedata.nModified == 0) {
                model.Rate.updateOne({ _id: mongoose.Types.ObjectId(params.rate_id) }, { $push: { user_ratings: user_ratings } }).then(data => {
                    calculateAvgRating(params.rate_id);
                    var socket_data = {};
                    socket_data['data'] = { 'rate_id': params.rate_id, 'rate': params.rate };
                    ioh.toAllExceptExecuter('rate-add', user_id, socket_data);
                    cres.send(res, data, 'Rate reaction addded successfully');
                }).catch(function (err) {
                    cres.error(res, "Error", err);
                });
            }
            else cres.send(res, ratedata, 'Rate liked successfully');
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

function calculateAvgRating(id) {
    let condition = {};
    condition['_id'] = mongoose.Types.ObjectId(id);
    model.Rate.aggregate([
        { $match: condition },
        { $unwind: "$user_ratings" },
        {
            $group: { _id: "$_id", avg_rate: { $avg: "$user_ratings.rate" } }
        }
    ]
    ).then(data => {
        let params = {}
        console.log('data=========>', data);
        params.avg_rate = data[0].avg_rate;
        model.Rate.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: params }).then(function (ratedata) {

        }).catch(function (err) {
        });
    }).catch(function (err) {
        cres.error(res, "Error", err);
    });
}
/**
 * @api {post} /rate/star/update Update Rate star
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Rate Start
 * @apiGroup Rate
 * @apiParam {string}   rate_id     Rate id
 */
exports.updateRateStar = (req, res) => {
    const required_fields = { rate_id: 'string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        const user_id = req.user._id;
        const set = { $set: { "user_ratings.$.rate": params.rate } }
        const condition = { "_id": mongoose.Types.ObjectId(params.rate_id), "user_ratings.users": req.user._id };
        model.Rate.updateOne(condition, set).then(ratedata => {
            socket_data['data'] = { 'rate_id': params.rate_id, 'rate': params.rate };
            ioh.toAllExceptExecuter('rate-update', user_id, socket_data);
            cres.send(res, ratedata, 'Rate updated successfully');
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /rate/like/remove Remove Rate Like
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Rate like
 * @apiGroup Rate
 * @apiParam {string}   rate_id     Rate id
 */
exports.removeRateLike = (req, res) => {
    const required_fields = { rate_id: 'string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        const user_ratings = { users: req.user._id }
        const condition = { _id: mongoose.Types.ObjectId(params.rate_id), 'user_ratings.users': req.user._id };
        model.Rate.updateOne(condition, { $pull: { user_ratings: user_ratings } }).then(data => {
            var socket_data = {};
            socket_data['data'] = { 'rate_id': params.rate_id, 'liked': 0 };
            ioh.toAllExceptExecuter('rate-add', user_id, socket_data);
            cres.send(res, data, 'Rate disliked');
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /rate/list List All Rate
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Rate
 * @apiParam {integer}  [limit]     No. of records to show.     
 * @apiParam {string}  [user_id]    User id of loggedin user   
 * @apiGroup Rate
 */
exports.ListRate = (req, res) => {

    const params = req.body;
    let condition = {}

    if (params.user_id) {
        condition['by_user'] = mongoose.Types.ObjectId(req.user._id);
    }
    if (params.rate_id) {
        condition['_id'] = { $lt: mongoose.Types.ObjectId(params.rate_id) };
    }
    const sort = -1;
    const orderbyfield = "created_at";
    const sortby = { [orderbyfield]: sort };

    model.Rate.find(condition).
        lean({ getters: true }).
        populate({ path: 'by_user', select: { _id: 1, name: 1, profile_pic: 1 } }).
        limit(params.limit).
        sort(sortby).
        then(data => {
            if (data.length > 0) cres.send(res, data, 'Rate List')
            else cres.send(res, [], "No record found");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });;

}


exports.cronRatemeTrending = (req, res) => {

    //condition = {'user_ratings.created_at': {$gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))}}
    var date = new Date();
    model.Rate.aggregate(
        [
            {
                $project: {
                    user_ratings: {
                        $filter: {
                            input: "$user_ratings", as: "liked",
                            cond: { $gte: ["$$liked.created_at", new Date(date.setMonth(date.getMonth() - 1))] }
                        }
                    }
                }
            },
            { $unwind: "$user_ratings" },
            {
                $group: { _id: "$_id", total_rate: { $sum: "$user_ratings.rate" } }
            }
        ]
    ).then(data => {
        if (data.length > 0) {
            let trending = [];
            for (let i = 0; i < data.length; i++) {
                trending.push({ 'rate_id': data[i]._id, 'total_rate': data[i].total_rate });
            }
            model.RatemeTrending.create(trending).then(function (ratedata) {
                cres.send(res, data, 'Rate List');
            }).catch(function (err) {
                cres.error(res, "Error", err);
            });
        }
        else {
            cres.send(res, [], "No record found");
        }
    }).catch(function (err) {
        cres.error(res, "Error", err);
    });
}



function AddUpdateRate(params, res, req, action) {

    params['by_user'] = req.user._id;
    params['user_ratings'] = [];

    if (!params.id && action == 'create') {
        params['rate_photo'] = common.moveFile(params.rate_photo, 'rate');
        model.Rate.create(params).then(function (ratedata) {
            ioh.toAllExceptExecuter('rate-add', Obj.user_id, ratedata);
            cres.send(res, ratedata, "Rate created successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
    else {
        params['rate_photo'] = common.moveFile(params.new_rate_photo, 'rate', params.rate_photo);
        model.Rate.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, { $set: params }).then(function (ratedata) {
            cres.send(res, ratedata, "Rate updated successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}