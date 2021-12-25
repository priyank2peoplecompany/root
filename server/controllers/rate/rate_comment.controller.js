const common = require('../../helpers/common.helper');
const ioh = require('../../helpers/socket.helper');
const RateSocket = require('./rate.socket');
/**
 * @api {post} /rate/comment/add Add Comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment
 * @apiGroup Rate Comment
 * @apiParam {string}   comment           Comment
 * @apiParam {string}   rate_id           Rate Id
 * @apiParam {string}   [parent_id]       Parent Comment Id
 * @apiParam {string}   [file]            Comment File 
 */
exports.addRateComment = (req, res) => {
    let required_fields = { 'comment': 'string', rate_id: 'string', file: 'optional|string', parent_id: 'optional|string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['file'] = common.moveFile(params.file, 'rate_comment');
        params['user_id'] = req.user._id;
        params['reacted'] = [];
        if (!params.parent_id) params['parent_id'] = null;
        model.RateComment.create(params).then(function (data) {
            setRateCount(data, 'new-rate-comment', req.user._id);
            cres.send(res, data, "Comment created successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /rate/comment/remove Remove Comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment
 * @apiGroup Rate Comment
 * @apiParam {string}   comment_id          Comment Id  
 */
exports.removeRateComment = (req, res) => {
    let required_fields = { 'comment_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.RateComment.findOne({ user_id: req.user._id, _id: mongoose.Types.ObjectId(params.comment_id) }).then(function (data) {
            if (data && data._id) {
                model.RateComment.remove().or([{ _id: mongoose.Types.ObjectId(params.comment_id) }, { parent_id: mongoose.Types.ObjectId(params.comment_id) }]).then(function (removedata) {
                    if (removedata.deletedCount == 1) setRateCount(data, 'remove-rate-comment', req.user._id);
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
 * @api {post} /rate/comment/list Rate Comment List
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Rate Comment List
 * @apiGroup Rate Comment
 * @apiParam {string}   rate_id    Selected Comment id
 * @apiParam {string}   [comment_id]    Last Comment id
 * @apiParam {integer}  limit           Number of record display per page
 */
exports.getRateComments = (req, res) => {
    let required_fields = { rate_id: 'string', comment_id: 'optional|string', limit: 'integer' }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        let sortby = { updated_at: -1 }
        let condition = { rate_id: mongoose.Types.ObjectId(params.rate_id), parent_id: null };
        if (params.comment_id != '' && params.comment_id != undefined) {
            let comment_id = mongoose.Types.ObjectId(params.comment_id);
            condition['_id'] = { $lt: comment_id };
        }

        model.RateComment.find(condition).sort(sortby).limit(params.limit).then((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data.length > 0) cres.send(res, data, 'Comment List');
                else cres.send(res, [], 'No record found');
            }
        });
    }
}

/**
 * @api {post} /rate/comment/reaction/add Add Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment Reaction
 * @apiGroup Rate Comment
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   comment_id      Comment id
 */
exports.addRateCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { $and: [{ _id: mongoose.Types.ObjectId(params.comment_id) }, { 'reacted.users': req.user._id }] };
        model.RateComment.updateOne(condition, { $set: { reacted: reacted } }).then(commentdata => {
            if (commentdata.nModified == 0) {
                model.RateComment.updateOne({ _id: mongoose.Types.ObjectId(params.comment_id) }, { $push: { reacted: reacted } }).then(data => {
                    params['user_id'] = req.user._id;
                    RateSocket.allRateSocket('new-rate-comment-reaction', req.user._id, params);
                    cres.send(res, data, 'Comment reaction addded successfully');
                }).catch(err => {
                    cres.error(res, err, {});
                });
            }
            else {
                params['user_id'] = req.user._id;
                RateSocket.allRateSocket('new-rate-comment-reaction', req.user._id, params);
                cres.send(res, commentdata, 'Comment reaction addded successfully');
            }
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /rate/comment/reaction/remove Remove Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Comment Reaction
 * @apiGroup Rate Comment
 * @apiParam {string}   reaction        Reaction
 * @apiParam {string}   comment_id      Comment id
 */
exports.removeRateCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { _id: mongoose.Types.ObjectId(params.comment_id), 'reacted.users': mongoose.Types.ObjectId(req.user._id) };
        model.RateComment.updateOne(condition, { $pull: { reacted: reacted } }).then(data => {
            params['user_id'] = req.user._id;
            RateSocket.allRateSocket('remove-rate-comment-reaction', req.user._id, params);
            cres.send(res, data, 'Comment reaction removed successfully');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

function setRateCount(Obj, action, user_id) {
    model.RateComment.count({ rate_id: mongoose.Types.ObjectId(Obj.rate_id) }).then(count => {
        model.Rate.updateOne({ _id: mongoose.Types.ObjectId(Obj.rate_id) }, { $set: { total_comments: count } }).then(userdata => {
            let data = { count: count, comment: Obj }
            RateSocket.allRateSocket(action, user_id, data);
        }).catch(err => {
            console.log("ERROR============", err);
        })
    }).catch(err => {
        console.log("ERROR============", err);
    });
}