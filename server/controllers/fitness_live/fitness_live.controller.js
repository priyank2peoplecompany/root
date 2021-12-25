const common = require('../../helpers/common.helper');
const FitnessliveSocket = require('./fitness_live.socket');
/**
 * @api {post} /fitnesslive/add Add Fitness Live
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Fitness Live
 * @apiGroup FitnessLive
 * @apiParam {string}   title               Title
 * @apiParam {array}    [tags]              Pass tags Id
 * @apiParam {string}   [description]       Description
 * @apiParam {array}    [video]             Video 
 */
exports.AddFitnesslive = (req, res) => {
    let required_fields = { title: 'string', description: 'optional|string', video: 'optional|string', tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        AddUpdateFitnessLive(params, res, req, 'create');
    }
}

/**
 * @api {post} /fitnesslive/update Update Fitness Live
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Fitness Live
 * @apiGroup FitnessLive
 * @apiParam {string}   id                  FitnessLive Id
 * @apiParam {string}   title               Title
 * @apiParam {array}    [tags]              Pass tags Id
 * @apiParam {string}   [description]       Description
 * @apiParam {array}    [videos]            Video  ( Array of Videos)
 * @apiParam {array}    [new_videos]        Video  ( Array of Videos)
 * @apiParam {array}    [removed_videos]    Video  ( Array of Videos)
 */
exports.UpdateFitnesslive = (req, res) => {
    let required_fields = { id: 'string', title: 'string', description: 'optional|string', photos: 'optional|array', videos: 'optional|array', tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        AddUpdateFitnessLive(params, res, req, 'create');
    }
}

/**
 * @api {post} /fitnesslive/remove Remove Fitness Live
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Fitness Live
 * @apiGroup FitnessLive
 * @apiParam {string}   fitness_live_id    Fitness Live Id  
 */
exports.removeFitnesslive = (req, res) => {
    let required_fields = { 'fitness_live_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Fitnesslive.findOne({ added_by: req.user._id, _id: mongoose.Types.ObjectId(params.fitness_live_id) }).then(function (data) {
            if (data && data._id) {
                model.Community.remove({ _id: mongoose.Types.ObjectId(params.community_id) }).then(function (removedata) {
                    if (removedata.deletedCount == 1) FitnessliveSocket.allFitnessliveSocket('remove-fitnesslive', req.user._id, data);
                    cres.send(res, removedata, "Fitness live removed successfully");
                }).catch(function (err) {
                    console.log("error=====+>", err);
                    cres.error(res, "Error", err);
                })
            }
            else cres.send(res, {}, 'Please check your comment id');
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        })
    }
}

/**
 * @api {post} /fitnesslive/list List All Fitness Live
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Fitness Live
 * @apiParam {array}    [tags]      Tag Array ( for filter )
 * @apiGroup FitnessLive
 */
exports.ListFitnesslive = (req, res) => {
    let required_fields = { tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = {}
        if (params.tags && params.tags.length > 0) {
            let tags = params.tags.map(element => mongoose.Types.ObjectId(element));
            condition['tags'] = { $in: [tags] }
        }

        model.Fitnesslive.aggregate(
            [
                { $match: condition },
                {
                    $lookup: {
                        from: "users",
                        let: { "id": "$added_by" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                            { $project: { _id: 1, name: 1 } }
                        ],
                        as: "added_by"
                    }
                },
                { $unwind: "$added_by" },
                {
                    $lookup: {
                        from: "tags",
                        let: { "id": "$tags" },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $in: ["$_id", "$$id"] }, { $eq: ["$enabled", true] }] } } },
                            { $project: { _id: 1, tag: 1 } }
                        ],
                        as: "tags"
                    }
                },
                {
                    $project: {
                        total_reacted: { $cond: { if: { $isArray: "$reacted" }, then: { $size: "$reacted" }, else: 0 } },
                        photos: {
                            $map: {
                                input: "$photos", as: "photos",
                                in: { $concat: [`${process.env.ASSETS_URL}uploads/`, "$$photos"] }
                            }
                        },
                        videos: {
                            $map: {
                                input: "$videos", as: "videos",
                                in: { $concat: [`${process.env.ASSETS_URL}uploads/`, "$$videos"] }
                            }
                        },
                        reacted: {
                            $filter: {
                                input: "$reacted", as: "react",
                                cond: { $eq: ["$$react.users", mongoose.Types.ObjectId(req.user._id)] }
                            }
                        }, _id: 1, title: 1, description: 1, updated_at: 1, created_at: 1, added_by: 1, tags: 1
                    }
                }
            ]
        ).then((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data.length > 0) cres.send(res, data, 'Fitnesslive List')
                else cres.send(res, [], "No record found");
            }
        });
    }
}

/**
 * @api {post} /fitnesslive/reaction/add Add Fitness Live Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Fitness Live Reaction
 * @apiGroup FitnessLive
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   fitness_live_id    FitnessLive id
 */
exports.addFitnessliveReaction = (req, res) => {
    let required_fields = { reaction: 'string', fitness_live_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { $and: [{ _id: mongoose.Types.ObjectId(params.fitness_live_id) }, { 'reacted.users': req.user._id }] };
        model.Fitnesslive.updateOne(condition, { $set: { reacted: reacted } }).then((err, data) => {
            if (data.nModified == 0) {
                model.Fitnesslive.updateOne({ _id: mongoose.Types.ObjectId(params.fitness_live_id) }, { $push: { reacted: reacted } }).then((err, comm_data) => {
                    params['user_id'] = req.user._id;
                    FitnessliveSocket.allFitnessliveSocket('new-fitnesslive-reaction', req.user._id, params);
                    cres.send(res, comm_data, 'Fitness Live reaction addded successfully');
                }).catch(err => {
                    cres.error(res, "Error", err);
                });
            }
            else {
                params['user_id'] = req.user._id;
                FitnessliveSocket.allFitnessliveSocket('new-fitnesslive-reaction', req.user._id, params);
                cres.send(res, comm_data, 'Fitness Live reaction addded successfully');
            }
        }).catch(err => {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /fitnesslive/reaction/remove Remove Fitness Live Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove  Fitness Live Reaction
 * @apiGroup FitnessLive
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   fitness_live_id FitnessLive id
 */
exports.removeFitnessliveReaction = (req, res) => {
    let required_fields = { reaction: 'string', fitness_live_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: req.user._id }
        let condition = { _id: mongoose.Types.ObjectId(params.fitness_live_id), 'reacted.users': req.user._id };
        model.Fitnesslive.updateOne(condition, { $pull: { reacted: reacted } }).then(data => {
            params['user_id'] = req.user._id;
            FitnessliveSocket.allFitnessliveSocket('remove-fitnesslive-reaction', req.user._id, params);
            cres.send(res, data, 'Fitness Live reaction removed successfully');
        }).catch(err => {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /fitnesslive/details Fitness Live Details
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Community Details
 * @apiParam {string}   fitness_live_id     FitnessLive id
 * @apiGroup FitnessLive
 */
exports.FitnessliveDetails = async (req, res) => {
    let required_fields = { fitness_live_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Fitnesslive.findOne({ _id: mongoose.Types.ObjectId(params.fitness_live_id) }).
            populate({ path: 'added_by', select: { _id: 1, name: 1 } }).
            populate({ path: 'tags', select: { _id: 1, tag: 1 } }).
            populate({ path: 'reacted.users', select: { _id: 1, name: 1 } }).
            then(fitnesslivedata => {
                if (fitnesslivedata) {
                    getCommentCount(fitnesslivedata._id).then(function (count) {
                        fitnesslivedata = fitnesslivedata.toJSON();
                        fitnesslivedata['comment_count'] = count;
                        cres.send(res, fitnesslivedata, "Fitness Live data details");
                    }).catch(function (err) {
                        console.log("error=====+>", err);
                        cres.error(res, "Error", err);
                    });
                }
                else cres.send(res, [], 'No record found')
            }).catch(err => {
                cres.error(res, "Error", err);
            });
    }
}

function AddUpdateFitnessLive(params, res, req, action) {
    params['added_by'] = req.user._id;
    params['reacted'] = [];

    if (!params.id && action == 'create') {

        params['videos'] = common.moveFiles(params.videos, 'fitnesslive');
        model.Fitnesslive.create(params).then(function (fitnesslivedata) {
            FitnessliveSocket.allFitnessliveSocket('new-fitnesslive', req.user._id, fitnesslivedata)
            cres.send(res, fitnesslivedata, "Fitness Live created successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
    else {
        params.videos = common.moveFiles(params.videos, params.new_videos, 'community', params.removed_videos);
        model.Fitnesslive.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, { $set: params }).then(function (fitnesslivedata) {
            cres.send(res, fitnesslivedata, "Fitness Live updated successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
}

function getCommentCount(fitness_live_id) {
    return model.FitnessliveComment.count({ fitness_live_id: mongoose.Types.ObjectId(fitness_live_id), parent_id: null });
}