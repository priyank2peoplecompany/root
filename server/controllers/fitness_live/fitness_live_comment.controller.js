const common = require('../../helpers/common.helper');
const ioh = require('../../helpers/socket.helper');
const FitnessliveSocket = require('./fitness_live.socket');
/**
 * @api {post} /fitnesslive/comment/add Add Fitness Live comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Fitness Live comment
 * @apiGroup FitnessLive Comment
 * @apiParam {string}   comment           Comment
 * @apiParam {string}   fitness_live_id   Fitness Live Id
 * @apiParam {string}   [parent_id]       Parent Comment Id
 * @apiParam {string}   [file]            Comment File 
 */
exports.AddFitnessliveComment = (req, res) => {
    let required_fields = { 'comment': 'string', fitness_live_id: 'string', file: 'optional|string', parent_id: 'optional|string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['file'] = common.moveFile(params.file, 'fitness_live_comment');
        params['user_id'] = req.user._id;
        params['reacted'] = [];
        if (!params.parent_id) params['parent_id'] = null;
        model.FitnessliveComment.create(params).then(function (data) {
            cres.send(res, data, "Comment created successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /fitnesslive/comment/remove Remove Comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Fitness Live comment
 * @apiGroup FitnessLive Comment
 * @apiParam {string}   fitness_live_id          Fitness Live Id  
 */
exports.removeFitnessliveComment = (req, res) => {
    let required_fields = { 'comment_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.CommunityComment.findOne({ user_id: req.user._id, _id: mongoose.Types.ObjectId(params.comment_id) }).then(function (data) {
            if (data && data._id) {
                model.CommunityComment.remove({ _id: mongoose.Types.ObjectId(params.comment_id) }).then(function (removedata) {
                    if (removedata.deletedCount == 1) setFitnessliveCount(data, 'remove-fitnesslive-comment', req.user._id);
                    cres.send(res, removedata, "Comment removed successfully");
                }).catch(function (err) {
                    console.log("error=====+>", err);
                    cres.error(res, "Error", err);
                })
            }
            else {
                cres.send(res, {}, 'Please check your comment id');
            }
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        })
    }
}

/**
 * @api {post} /fitnesslive/comment/list Fitness Live Comment List
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Fitness Live Comment List
 * @apiGroup FitnessLive Comment
 * @apiParam {string}   fitness_live_id Selected Comment id
 * @apiParam {string}   [comment_id]    Last Comment id
 * @apiParam {integer}  limit           Number of record display per page
 */
exports.getFitnessliveComments = (req, res) => {
    let required_fields = { fitness_live_id: 'string', comment_id: 'optional|string', limit: 'integer' }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        let sortby = { updated_at: -1 }
        let condition = { fitness_live_id: mongoose.Types.ObjectId(params.fitness_live_id), parent_id: null };
        if (params.comment_id != '' && params.comment_id != undefined) {
            let comment_id = mongoose.Types.ObjectId(params.comment_id);
            condition['_id'] = { $lt: comment_id };
        }
        model.FitnessliveComment.find(condition).sort(sortby).limit(params.limit).then(data => {
            if (data.length > 0) cres.send(res, data, 'Comment List');
            else cres.send(res, [], 'No record found');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /fitnesslive/comment/reaction/add Add Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment Reaction
 * @apiGroup Comment
 * @apiParam {string}   reaction    User's reaction
 * @apiParam {string}   comment_id     Comment id
 */
exports.addFitnessliveCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { $and: [{ _id: mongoose.Types.ObjectId(params.comment_id) }, { 'reacted.users': req.user._id }] };
        model.FitnessliveComment.updateOne(condition, { $set: { reacted: reacted } }).then(commentdata => {
            if (commentdata.nModified == 0) {
                model.FitnessliveComment.updateOne({ _id: mongoose.Types.ObjectId(params.comment_id) }, { $push: { reacted: reacted } }).then(data => {
                    params['user_id'] = req.user._id;
                    FitnessliveSocket.allFitnessliveSocket('new-fitnesslive-comment-reaction', req.user._id, params);
                    cres.send(res, data, 'Comment reaction addded successfully');
                }).catch(err => {
                    cres.error(res, err, {});
                });
            }
            else {
                params['user_id'] = req.user._id;
                FitnessliveSocket.allFitnessliveSocket('new-fitnesslive-comment-reaction', req.user._id, params);
                cres.send(res, commentdata, 'Comment reaction addded successfully');
            }
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}


/**
 * @api {post} /fitnesslive/comment/reaction/remove Remove Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Comment Reaction
 * @apiGroup Community Comment
 * @apiParam {string}   reaction        Reaction
 * @apiParam {string}   comment_id      Comment id
 */
exports.removeFitnessliveCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { _id: mongoose.Types.ObjectId(params.comment_id), 'reacted.users': mongoose.Types.ObjectId(req.user._id) };
        model.FitnessliveComment.updateOne(condition, { $pull: { reacted: reacted } }).then(data => {
            params['user_id'] = req.user._id;
            FitnessliveSocket.allFitnessliveSocket('remove-fitnesslive-comment-reaction', req.user._id, params);
            cres.send(res, data, 'Comment reaction removed successfully');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

function setFitnessliveCount(Obj, action, user_id) {
    model.FitnessliveComment.count({ community_id: mongoose.Types.ObjectId(Obj.fitness_live_id) }).then(count => {
        model.Community.updateOne({ _id: mongoose.Types.ObjectId(Obj.fitness_live_id) }, { $set: { total_comments: count } }).then((userdata) => {
            let data = { count: count, comment: Obj }
            FitnessliveSocket.allFitnessliveSocket(action, user_id, data);;
        }).catch(err => {
            console.log("ERROR============", err);
        })

    }).catch(err => {
        console.log("ERROR============", err);
    });
}