const common = require('../../helpers/common.helper');
const CommunitySocket = require('./community.socket');
/**
 * @api {post} /community/add Add Community
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Community
 * @apiGroup Community
 * @apiParam {string}   title               Title
 * @apiParam {array}    [tags]              Pass tags Id
 * @apiParam {string}   [description]       Description
 * @apiParam {array}    [photos]            Photo ( Array of Photos)
 * @apiParam {array}    [videos]            Video  ( Array of Videos)
 */
exports.AddCommunity = (req, res) => {
    let required_fields = { title: 'string', description: 'optional|string', photos: 'optional|array', videos: 'optional|array', tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        AddUpdateCommunity(params, res, req, 'create');
    }
}

/**
 * @api {post} /community/update Update Community
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Community
 * @apiGroup Community
 * @apiParam {string}   id                  Community Id
 * @apiParam {string}   title               Title
 * @apiParam {array}    [tags]              Pass tags Id
 * @apiParam {string}   [description]       Description
 * @apiParam {array}    [photos]            Photo ( Array of Photos)
 * @apiParam {array}    [removed_photos]    Removed Photo ( Array of Photos)
 * @apiParam {array}    [new_photos]        New Photo ( Array of Photos)
 * @apiParam {array}    [videos]            Video  ( Array of Videos)
 * @apiParam {array}    [removed_videos]    Removed Videos ( Array of Videos)
 * @apiParam {array}    [new_videos]        New Videos ( Array of Videos)
 */
exports.UpdateCommunity = (req, res) => {
    let required_fields = { id: 'string', title: 'string', description: 'optional|string', photos: 'optional|array', videos: 'optional|array', tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        AddUpdateCommunity(params, res, req, 'create');
    }
}

/**
 * @api {post} /community/remove Remove Community
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Community
 * @apiGroup Community Comment
 * @apiParam {string}   community_id    Commmunity Id  
 */
exports.removeCommunity = (req, res) => {
    let required_fields = { 'community_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Community.findOne({ added_by: req.user._id, _id: mongoose.Types.ObjectId(params.community_id) }).then(function (data) {
            if (data && data._id) {
                model.Community.deleteOne({ _id: mongoose.Types.ObjectId(params.community_id) }).then(function (removedata) {
                    if (removedata.deletedCount == 1) removeComment(req.user._id, data);
                    cres.send(res, removedata, "Comment removed successfully");
                }).catch(function (err) {
                    console.log("error=====+>", err);
                    cres.error(res, "Error", err);
                })
            }
            else cres.send(res, {}, 'Please check your community id');
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        })
    }
}

/**
 * @api {post} /community/list List All Community
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Community
 * @apiParam {array}    [tags]      Tag Array ( for filter )
 * @apiGroup Community
 */
exports.ListCommunity = (req, res) => {
    let required_fields = { tags: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = {}
        if (params.tags && params.tags.length > 0) {
            let tags = params.tags.map(element => mongoose.Types.ObjectId(element));
            condition['tags'] = { $in: [tags] }
        }

        model.Community.aggregate(
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
        ).then(data => {
            if (data.length > 0) cres.send(res, data, 'Community List')
            else cres.send(res, [], "No record found");
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /community/reaction/add Add Community Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Community Reaction
 * @apiGroup Community
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   community_id    Community Id
 */
exports.addCommunityReaction = (req, res) => {
    let required_fields = { reaction: 'string', community_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { $and: [{ _id: mongoose.Types.ObjectId(params.community_id) }, { 'reacted.users': req.user._id }] };
        model.Community.updateOne(condition, { $set: { reacted: reacted } }).then(data => {
            if (data.nModified == 0) {
                model.Community.updateOne({ _id: mongoose.Types.ObjectId(params.community_id) }, { $push: { reacted: reacted } }).then(comm_data => {
                    params['user_id'] = req.user._id;
                    CommunitySocket.allCommunitySocket('new-community-reaction', req.user._id, params);
                    cres.send(res, comm_data, 'Community reaction addded successfully');
                }).catch(err => {
                    cres.error(res, err, {});
                });
            }
            else {
                params['user_id'] = req.user._id;
                CommunitySocket.allCommunitySocket('new-community-reaction', req.user._id, params);
                cres.send(res, comm_data, 'Community reaction addded successfully');
            }
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /community/reaction/remove Remove Community Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Community Reaction
 * @apiGroup Community
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   community_id    Community id
 */
exports.removeCommunityReaction = (req, res) => {
    let required_fields = { reaction: 'string', community_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { _id: mongoose.Types.ObjectId(params.community_id), 'reacted.users': mongoose.Types.ObjectId(req.user._id) };
        model.Community.updateOne(condition, { $pull: { reacted: reacted } }).then(data => {
            params['user_id'] = req.user._id;
            CommunitySocket.allCommunitySocket('remove-community-reaction', req.user._id, params);
            cres.send(res, data, 'Community reaction removed successfully');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /community/details Community Details
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Community Details
 * @apiParam {string}   community_id     Community id
 * @apiGroup Community
 */
exports.CommunityDetails = async (req, res) => {
    let required_fields = { community_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.Community.findOne({ _id: mongoose.Types.ObjectId(params.community_id) }).
            populate({ path: 'added_by', select: { _id: 1, name: 1 } }).
            populate({ path: 'tags', select: { _id: 1, tag: 1 } }).
            populate({ path: 'reacted.users', select: { _id: 1, name: 1 } }).
            then(communitydata => {
                if (communitydata) {
                    getCommentCount(communitydata._id).then(function (count) {
                        communitydata = communitydata.toJSON();
                        communitydata['comment_count'] = count;
                        cres.send(res, communitydata, "Feed details");
                    }).catch(function (err) {
                        console.log("error=====+>", err);
                        cres.error(res, "Error", err);
                    });
                }
                else cres.send(res, [], 'No record found')
            }).catch(err => {
                cres.error(res, err, {});
            });
    }
}

function AddUpdateCommunity(params, res, req, action) {

    params['added_by'] = req.user._id;
    params['reacted'] = [];

    if (!params.id && action == 'create') {
        params['photos'] = common.moveFiles(params.photos, 'community');
        params['videos'] = common.moveFiles(params.videos, 'community');

        model.Community.create(params).then(function (communitydata) {
            CommunitySocket.allCommunitySocket('new-community', req.user._id, communitydata)
            cres.send(res, communitydata, "Feed created successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
    else {

        params.photos = common.moveFiles(params.photos, params.new_photos, 'community', params.removed_photos);
        params.videos = common.moveFiles(params.videos, params.new_videos, 'community', params.removed_videos);

        model.Community.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, { $set: params }).then(function (communitydata) {
            cres.send(res, communitydata, "Feed updated successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
}

function getCommentCount(community_id) {
    return model.CommunityComment.count({ community_id: mongoose.Types.ObjectId(community_id), parent_id: null });
}

function removeComment(user_id, data) {
    CommunitySocket.allCommunitySocket('remove-community', user_id, data);

    model.CommunityComment.remove({ community_id: mongoose.Types.ObjectId(community_id) });

}