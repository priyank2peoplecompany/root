const common = require('../../helpers/common.helper');
const ioh = require('../../helpers/socket.helper');
const CommunitySocket = require('./community.socket');
/**
 * @api {post} /community/comment/add Add Comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment
 * @apiGroup Community Comment
 * @apiParam {string}   comment           Comment
 * @apiParam {string}   community_id      Community Id
 * @apiParam {string}   [parent_id]       Parent Comment Id
 * @apiParam {string}   [file]            Comment File 
 */
exports.addCommunityComment = (req, res) => {
    let required_fields = { 'comment': 'string', community_id: 'string', file: 'optional|string', parent_id: 'optional|string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['file'] = common.moveFile(params.file, 'community_comment');
        params['user_id'] = req.user._id;
        params['reacted'] = [];
        if (!params.parent_id) params['parent_id'] = null;
        model.CommunityComment.create(params).then(function (data) {
            setCommunityCount(data, 'new-community-comment', req.user._id);
            cres.send(res, data, "Comment created successfully");
        }).catch(function (err) {
            console.log("error=====+>", err);
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /community/comment/remove Remove Comment
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment
 * @apiGroup Community Comment
 * @apiParam {string}   comment_id          Comment Id  
 */
exports.removeCommunityComment = (req, res) => {
    let required_fields = { 'comment_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.CommunityComment.findOne({ user_id: req.user._id, _id: mongoose.Types.ObjectId(params.comment_id) }).then(function (data) {
            if (data && data._id) {
                common.removeFile(data.file);
                model.CommunityComment.remove().or([{ _id: mongoose.Types.ObjectId(params.comment_id) }, { parent_id: mongoose.Types.ObjectId(params.comment_id) }]).then(function (removedata) {
                    if (removedata.deletedCount == 1) setCommunityCount(data, 'remove-community-comment', req.user._id);
                    cres.send(res, removedata, "Comment removed successfully");
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
 * @api {post} /community/comment/list Community Comment List
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Community Comment List
 * @apiGroup Community Comment
 * @apiParam {string}   community_id    Selected Comment id
 * @apiParam {string}   [comment_id]    Last Comment id
 * @apiParam {integer}  limit           Number of record display per page
 */
exports.getCommunityComments = (req, res) => {
    let required_fields = { community_id: 'string', comment_id: 'optional|string', limit: 'integer' }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        let sortby = { updated_at: -1 }
        let condition = { community_id: mongoose.Types.ObjectId(params.community_id), parent_id: null };
        if (params.comment_id != '' && params.comment_id != undefined) {
            let comment_id = mongoose.Types.ObjectId(params.comment_id);
            condition['_id'] = { $lt: comment_id };
        }

        model.CommunityComment.find(condition).sort(sortby).limit(params.limit).then(data => {
            if (data.length > 0) cres.send(res, data, 'Comment List');
            else cres.send(res, [], 'No record found');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /community/comment/reaction/add Add Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Comment Reaction
 * @apiGroup Community Comment
 * @apiParam {string}   reaction        User's reaction
 * @apiParam {string}   comment_id      Comment id
 */
exports.addCommunityCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { reaction: params.reaction, users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { $and: [{ _id: mongoose.Types.ObjectId(params.comment_id) }, { 'reacted.users': req.user._id }] };
        model.CommunityComment.updateOne(condition, { $set: { reacted: reacted } }).then(commentdata => {
            if (commentdata.nModified == 0) {
                model.CommunityComment.updateOne({ _id: mongoose.Types.ObjectId(params.comment_id) }, { $push: { reacted: reacted } }).then(data => {
                    params['user_id'] = req.user._id;
                    CommunitySocket.allCommunitySocket('new-community-comment-reaction', req.user._id, params);
                    cres.send(res, data, 'Comment reaction addded successfully');
                }).catch(err => {
                    cres.error(res, err, {});
                });
            }
            else {
                params['user_id'] = req.user._id;
                CommunitySocket.allCommunitySocket('new-community-comment-reaction', req.user._id, params);
                cres.send(res, commentdata, 'Comment reaction addded successfully');
            }
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /community/comment/reaction/remove Remove Comment Reaction
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Comment Reaction
 * @apiGroup Community Comment
 * @apiParam {string}   reaction        Reaction
 * @apiParam {string}   comment_id      Comment id
 */
exports.removeCommunityCommentReaction = (req, res) => {
    let required_fields = { reaction: 'string', comment_id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let reacted = { users: mongoose.Types.ObjectId(req.user._id) }
        let condition = { _id: mongoose.Types.ObjectId(params.comment_id), 'reacted.users': mongoose.Types.ObjectId(req.user._id) };
        model.CommunityComment.updateOne(condition, { $pull: { reacted: reacted } }).then(data => {
            params['user_id'] = req.user._id;
            CommunitySocket.allCommunitySocket('remove-community-comment-reaction', req.user._id, params);
            cres.send(res, data, 'Comment reaction removed successfully');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

function setCommunityCount(Obj, action, user_id) {
    model.CommunityComment.count({ community_id: mongoose.Types.ObjectId(Obj.community_id) }).then(count => {
        model.Community.updateOne({ _id: mongoose.Types.ObjectId(Obj.community_id) }, { $set: { total_comments: count } }).then((userdata) => {
            let data = { count: count, comment: Obj }
            CommunitySocket.allCommunitySocket(action, user_id, data);
        }).catch(err => {
            console.log("ERROR============", err);
        })
    }).catch(err => {
        console.log("ERROR============", err);
    });
}