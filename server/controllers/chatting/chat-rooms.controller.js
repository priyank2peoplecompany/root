const common = require('../../helpers/common.helper');
/**
 * @api {post} /chat-rooms Room List 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List 
 * @apiGroup Chat Room
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {integer}  skip        Number of record want to skip
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name only)
*/
exports.getRooms = (req, res) => {
    let required_fields = { limit: 'integer', sort: 'string', orderby: 'string', skip: 'integer' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let orderbyfield = params.orderby;
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        let condition = {}
        condition['users'] = { $elemMatch: { $eq: req.user._id } }
        if (params.search != "" && params.search != undefined) {
            let searchtxt = params.search;
            condition['name'] = { '$regex': new RegExp("^" + searchtxt, "i") };
        }
        model.ChatRoom.find(condition)
            .populate('users', { '_id': 1, 'email': 1, 'role_id': 1, 'name': 1, 'profile_pic': 1 })
            .populate({ path: 'message', select: { _id: 1, message: 1, senderid: 1, unreaduserid: 1 } })
            .populate({ path: 'count', match: { unreaduserid: { $elemMatch: { $eq: req.user._id } } } })
            .sort(sortby).skip(params.skip).limit(params.limit)
            .then(roomdata => {
                if (roomdata.length > 0) cres.send(res, roomdata, 'Room List')
                else cres.send(res, [], 'No record found')
            }).catch(err => {
                cres.error(res, err, {});
            });
    }
}

/**
 * @api {post} /chat-room/create Create Room
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Room
 * @apiGroup Chat Room
 * @apiParam {String}       name          Room name
 * @apiParam {String}       description   Room Description
 * @apiParam {Array}        users         Array of user ids ( e.g. [1,2,3] )
 * @apiParam {String}       [logo]        Room Icon
 */
exports.createRoom = (req, res) => {
    let required_fields = { 'name': 'string', 'users': 'array', 'description': 'optional|string', 'logo': 'optional|string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let users = params.users;
        users.push(req.user._id);
        params['logo'] = common.moveFile(params.logo, 'chat/room');
        let uniqueusers = users.filter((it, i, ar) => ar.indexOf(it) === i);
        model.ChatRoom.create({ name: params.name, description: params.description, created_by: req.user._id, users: uniqueusers, logo, type: 1 }).then(chatRoomObj => {
            cres.send(res, chatRoomObj, 'Room created successfully');
        }).catch(err => {
            console.log(err);
            cres.statusError(res);
        });
    }
}


/**
 * @api {get} /chat-room/count Room Unread Message Count
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Room Unread Message Count
 * @apiGroup Chat Room
 */
exports.getUserCount = (req, res) => {
    model.ChatMessage.aggregate([
        { $match: { unreaduserid: { $elemMatch: { $eq: mongoose.Types.ObjectId(req.user._id) } } } },
        { $group: { _id: '$room_id', count: { $sum: 1 } } }
    ]).then(roomdata => {
        cres.send(res, { count: roomdata.length }, 'Total Count')
    }).catch(err => {
        cres.error(res, err, {});
    });
}

/**
 * @api {post} /chat-room/update Update Room
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Update Room
 * @apiGroup Chat Room
 * @apiParam {String}       id              Room Id
 * @apiParam {String}       name            Room name
 * @apiParam {String}       [description]   Room description
 * @apiParam {String}       [logo]          Room Icon
 * @apiParam {string}       [new_logo]      Old Icon
 */
exports.updateRoom = (req, res) => {
    let required_fields = { name: 'string', description: 'optional|string', users: 'optional|array', logo: 'optional|string', id: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        this.getGroupDetail(params.id, req.user._id).then(roomData => {
            // 1. Check if group id is valid or not
            if (roomData) {
                params['logo'] = common.moveFile(params.new_logo, 'chat/room', params.logo);
                model.ChatRoom.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, {
                    $set: { name: params.name, description: params.description, created_by: req.user._id, users: roomData.users, logo }
                }).then(chatRoomObj => {
                    cres.send(res, chatRoomObj, 'Room updated successfully');
                }).catch(err => {
                    console.log(err);
                    cres.statusError(res);
                });
            } else cres.error(res, "No such group exists", {});
        }).catch(err => {
            cres.error(res, err, {});
        })
    }
}

/**
 * @api {post} /chat-room/user/add Add Users
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Users
 * @apiGroup Chat Room
 * @apiParam {string}   id      Room's ID
 * @apiParam {array}    users   Array of user ids ( e.g. [1,2,3] )
 */
exports.addUser = (req, res) => {
    let required_fields = { 'users': 'array', 'id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {

        this.getGroupDetail(params.id, req.user._id).then(roomData => {
            // 1. Check if group id is valid or not
            if (roomData) {
                if (roomData.created_by == req.user._id) {
                    let users = roomData.users;
                    let newuserdata = params.users;
                    let u = newuserdata.filter(n => !users.includes(n));
                    let newusers = users.concat(newuserdata);
                    let uniqueusers = newusers.filter((it, i, ar) => ar.indexOf(it) === i);
                    if (roomData.type == 1) {
                        model.ChatRoom.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, {
                            $set: { users: uniqueusers }
                        }).then(chatRoomObj => {
                            getUsers(u, req.user, params.id, uniqueusers);
                            cres.send(res, chatRoomObj, 'User added successfully to room');
                        }).catch(err => {
                            console.log(err);
                            cres.statusError(res);
                        });
                    }
                    else if (roomData.type == 0) {
                        model.ChatRoom.create({ name: '', created_by: req.user._id, users: uniqueusers, type: 1 }).then(chatRoomObj => {
                            cres.send(res, chatRoomObj, 'Room created successfully');
                        }).catch(err => {
                            console.log(err);
                            cres.statusError(res);
                        });
                    }
                }
                else cres.error(res, "Only group admin can add new users to group", {});
            } else cres.error(res, "No such group exists", {});
        })
    }
}


/**
 * @api {post} /chat-room/user/remove Remove Users
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Remove Users
 * @apiGroup Chat Room
 * @apiParam {string}   id      Room's ID
 * @apiParam {array}    users   Array of user ids ( e.g. [1,2,3] )
 */
exports.removeUser = (req, res) => {
    let required_fields = { 'users': 'array', 'id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        this.getGroupDetail(params.id, req.user._id).then(roomData => {
            // 1. Check if group id is valid or not
            if (roomData) {
                if (roomData.created_by == req.user._id) {
                    let users = roomData.users;
                    let removeUser = params.users;
                    users = users.filter((el) => removeUser.indexOf(el.toString()) < 0);
                    model.ChatRoom.updateOne({ _id: mongoose.Types.ObjectId(params.id) }, {
                        $set: { users: users }
                    }).then(chatRoomObj => {
                        getUsers(removeUser, req.user, params.id, users, true);
                        cres.send(res, chatRoomObj, 'User added successfully to room');
                    }).catch(err => {
                        console.log(err);
                        cres.statusError(res);
                    });
                }
                else cres.error(res, "Only group admin can add new users to group", {});
            } else cres.error(res, "No such group exists", {});
        })
    }
}

/**
 * @api {post} /chat-room Get Detail
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Get Room Detail
 * @apiGroup Chat Room
 * @apiParam {string}    id     Room ID
 */
exports.getDetail = (req, res) => {
    let required_fields = { 'id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        getRoomDetais(params.id, res);
    }
}

/**
 * @api {post} /check-room Check Room
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Check Room
 * @apiGroup Chat Room
 * @apiParam {string}    id     User Id
 */
exports.getRoomDetail = (req, res) => {
    let required_fields = { 'id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = {
            type: 0,
            $and: [{ users: { $elemMatch: { $eq: params.id } } }, { users: { $elemMatch: { $eq: req.user._id } } }]
        };
        model.ChatRoom.findOne(condition).then(roomdata => {
            if (roomdata) getRoomDetais(roomdata._id, res);
            else cres.error(res, "No such room exists", {});
        }).catch(err => {
            console.log(err);
            cres.statusError(res);
        });
    }
}

/**
 * -----------------------------------------------------------------------------------
 *                                  HELPER FUNCTIONS
 * -----------------------------------------------------------------------------------  
 */

/**
 * To Check if there is any private group for user1 and user2
 */
exports.findPrivateGroup = (user_id1, user_id2) => {
    let condition = {
        type: 0,
        $or: [
            { $and: [{ users: { $elemMatch: { $eq: user_id1 } } }, { created_by: user_id2 }] },
            { $and: [{ users: { $elemMatch: { $eq: user_id2 } } }, { created_by: user_id1 }] }
        ],
    };

    return model.ChatRoom.find(condition).then((data) => {
        if (data.length > 0) return data[0];
        else return null;
    });
}

/**
 * Get the detail of given group id 
 */
exports.getGroupDetail = (group_id, user_id) => {
    return model.ChatRoom.findOne({ _id: mongoose.Types.ObjectId(group_id), users: { $elemMatch: { $eq: user_id } } });
}

/**
 * Create a chat group with clone ( versioning )
 */
exports.createAutoGroup = (req, type, users = [], title = null) => {
    let chatusers = users.map(user => (mongoose.Types.ObjectId(user)));
    let chatRoom = {
        type,
        created_by: chatusers[0],
        name: title,
        users: chatusers,
        logo: ''
    }
    return model.ChatRoom.create(chatRoom);
}

/**
 * Get Group Details
 */
function getRoomDetais(id, res) {
    model.ChatRoom.findOne({ _id: id })
        .populate('users', { _id: 1, email: 1, role_id: 1, name: 1, profile_pic: 1 })
        .populate({ path: 'message', select: { _id: 1, message: 1, senderid: 1 } })
        .then(chatRoom => {
            if (chatRoom) cres.send(res, chatRoom, 'Room details');
            else cres.error(res, "No such room exists", {});
        }).catch(err => {
            console.log(err);
            cres.statusError(res);
        });
}

// Add new user in group system message
function getUsers(users, payload, room_id, receiverid, removeUser = false) {
    model.User.find({ _id: { $in: users } }, { name: 1 }).then((userdata) => {
        if (userdata.length > 0) {
            let username = [];
            userdata.forEach(element => {
                username.push(`${element.name}`);
            });
            if (username.length > 0) {
                var index = receiverid.indexOf(payload._id);
                if (index >= 0) receiverid.splice(index, 1);
                let user = username.join(',');
                let createdby = `${payload.name}`;
                let message = `${createdby} added ${user} to this conversation`;
                if (removeUser == true) message = `${createdby} removed ${user} to this conversation`;
                let messageObj = { room_id, senderid: payload._id, message: message, receiverid, type: 0 }
                model.ChatMessage.create(messageObj);
            }
        }
    }).catch(err => {
        console.log("ERROR============", err);
    })
}