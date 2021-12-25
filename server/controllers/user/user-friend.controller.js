const ioh = require('../../helpers/socket.helper');
/**
 * @api {post} /user/friend/add Send Friend Request
 * @apiName  Send Friend Request
 * @apiParam {string}   user_id     User Id
 * @apiGroup User Friend
 */
exports.addFriendRequest = (req, res) => {
    let required_fields = { 'user_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.UserFriend.findOne({
            $or: [
                { $and: [{ sender: mongoose.Types.ObjectId(req.user._id) }, { receiver: mongoose.Types.ObjectId(params.user_id) }] },
                { $and: [{ receiver: mongoose.Types.ObjectId(req.user._id) }, { sender: mongoose.Types.ObjectId(params.user_id) }] }
            ]
        }).select('_id status').lean().then((data) => {
            if (data && data._id) {
                model.UserFriend.
                    updateOne({ _id: mongoose.Types.ObjectId(data._id) }, { $set: { status: 1 } }).
                    then((resultData) => {
                        if (err) {
                            cres.error(res, "Error in sending friend request", {});
                        } else {
                            cres.send(res, resultData, "Friend request sent successfully", {});
                        }
                    });
            }
            else {
                let insData = { receiver: params.user_id, sender: req.user._id, status: 1, is_blocked: false }
                model.UserFriend.create(insData).then(resultData => {
                    cres.send(res, resultData, "Friend request sent successfully");
                }).catch(err => {
                    console.log('Error=====>', err);
                    cres.error(res, "Error in auto login", {});
                });
            }
        }).catch(err => {
            cres.error(res, "Error in sending friend request", {});
        });
    }
}

/**
 * @api {post} /user/friend/list User Friend List
 * @apiName  User Friend List
 * @apiParam {string}       type      friends,sentRequests,receivedRequests,allRequests
 * @apiGroup User Friend
 */
exports.listUserFriend = (req, res) => {
    const required_fields = { 'type': 'string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = {};
        switch (params.type) {
            case 'allRequests':
                condition = {
                    $and: [
                        { $or: [{ sender: mongoose.Types.ObjectId(req.user._id) }, { receiver: mongoose.Types.ObjectId(req.user._id) }] },
                        { status: 1 }
                    ]
                }
                break;
            case 'sentRequests':
                condition = { sender: mongoose.Types.ObjectId(req.user._id), status: 1 }
                break;
            case 'receivedRequests':
                condition = { receiver: mongoose.Types.ObjectId(req.user._id), status: 1 }
                break;
            case 'friends':
                condition = {
                    $and: [
                        { $or: [{ sender: mongoose.Types.ObjectId(req.user._id) }, { receiver: mongoose.Types.ObjectId(req.user._id) }] },
                        { status: 2 }
                    ]
                }
                break;
            default:
                break;
        }

        model.UserFriend.aggregate(
            [
                { $match: condition },
                {
                    $project: {
                        is_sender: {
                            $cond: { if: { $eq: ["$sender", mongoose.Types.ObjectId(req.user._id)] }, then: true, else: false }
                        },
                        user: {
                            $cond: { if: { $eq: ["$sender", mongoose.Types.ObjectId(req.user._id)] }, then: "$receiver", else: "$sender" }
                        },
                        _id: 1, sender: 1, receiver: 1, created_at: 1, is_blocked: 1
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { "id": "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                            { $project: { _id: 1, name: 1, is_online: 1 } }
                        ],
                        as: "user"
                    }
                },
                { $unwind: "$user" }
            ]
        ).exec((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data.length > 0) cres.send(res, data, 'Friend List')
                else cres.send(res, [], "No record found");
            }
        });
    }
}

/**
 * @api {post} /user/friend/accept Accept Friend Request
 * @apiName  Accept Friend Request
 * @apiParam {string}       id          Request Id
 * @apiGroup User Friend
 */
exports.acceptFriendRequest = (req, res) => {
    let required_fields = { 'id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.UserFriend.findOne({
            receiver: mongoose.Types.ObjectId(req.user._id), _id: mongoose.Types.ObjectId(params.id), status: 1
        }).lean().select('_id sender').then((data) => {
            if (data && data._id) {
                model.UserFriend.updateOne(
                    { _id: mongoose.Types.ObjectId(data._id) },
                    { $set: { status: 2 } })
                    .then(resultData => {
                        const senderId = data.sender;
                        ioh.toSpecificUser(senderId, `friend-request-accepted`, { data: req.user });
                        cres.send(res, resultData, `Friend request accepted successfully`);
                    }).catch(err => {
                        // console.log("Error=======", err);
                        cres.error(res, "Error in updating friend request", {});
                    })
            } else cres.error(res, "No record found", {});

        }).catch(err => {
            cres.error(res, "Error in updating friend request", {});
        });
    }
}

/**
 * @api {post} /user/friend/remove User Friend Remove
 * @apiName  User Friend Remove
 * @apiParam {string}       type        cancel( Also call this when anyone reject friend request)
 * @apiParam {string}       user_id     Request Id
 * @apiGroup User Friend
 */
exports.removeUserFriend = (req, res) => {
    const required_fields = { type: 'string', id: 'string' }
    const params = req.body;
    if (vh.validate(res, required_fields, params)) {
        const condition = { _id: mongoose.Types.ObjectId(params.id) };
        model.UserFriend.findOne(condition).then((friendData) => {
            if (friendData) {
                if (friendData.status == 2 && params.type == 'cancel') {
                    cres.error(res, 'Request no longer exists', {})
                } else {
                    model.UserFriend.deleteOne(condition).then((data) => {
                        cres.send(res, data, 'Friend removed successfully');
                    }).catch(err => {
                        cres.error(res, err, {});
                    })
                }
            }
            else cres.send(res, [], 'No record found')
        }).catch(err => {
            cres.error(res, err, {});
        })
    }
}