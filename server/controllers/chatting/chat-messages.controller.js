
const chatRooms = require('./chat-rooms.controller');
const common = require('../../helpers/common.helper');
/**
 * @api {post} /chat/messages Get Messages 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Get Messages
 * @apiGroup Chat Messages
 * @apiParam {string}   room_id     Selected Room id
 * @apiParam {string}   [message_id]  Last message id
 * @apiParam {integer}  limit       Number of record display per page
 */
exports.getMessages = (req, res) => {
    let required_fields = { room_id: 'string', message_id: 'optional|string', limit: 'integer' }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        chatRooms.getGroupDetail(params.room_id, req.user._id).then(roomData => {
            // 1. Check if group id is valid or not
            if (roomData) {
                let sortby = { updated_at: -1 }
                let condition = { room_id: mongoose.Types.ObjectId(params.room_id) };
                if (params.message_id != '' && params.message_id != undefined) {
                    let message_id = mongoose.Types.ObjectId(params.message_id);
                    condition['_id'] = { $lt: message_id };
                }
                model.ChatMessage.find(condition).
                    populate('sender', { '_id': 1, 'email': 1, 'role_id': 1, 'name': 1, 'profile_pic': 1 }).
                    sort(sortby).limit(params.limit).exec((err, messagedata) => {
                        if (err) cres.error(res, err, {});
                        else {
                            if (messagedata.length > 0) cres.send(res, messagedata, 'Message List');
                            else cres.send(res, [], 'No record found');
                        }
                    });
            } else {
                cres.error(res, "No such group exists", {});
            }
        })
    }
}

/**
 * @api {post} /chat/send/message Send Message 
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Send Message
 * @apiGroup Chat Messages
 * @apiParam {string}  [user_id]   Other user's id  
 * @apiParam {string}  [room_id]   Chat Room Id ( user_id | room_id one of them is mandatory )
 * @apiParam {string}   message     Message 
 * @apiParam {array}    [files]     Send Multiple Files
 */
exports.sendMessage = (req, res) => {
    let required_fields = {
        'message': 'optional|string',
        'user_id': 'optional|string',
        'room_id': 'optional|string',
        'files': 'optional|array'
    }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {

        if (params.room_id) {
            chatRooms.getGroupDetail(params.room_id, req.user._id).then(roomData => {

                // 1. Check if group id is valid or not
                if (roomData) {
                    // 2. Get Latest group version / add it to message
                    // 3. then add message to Chat Message    
                    let users = roomData.users;
                    let index = users.indexOf(req.user._id);
                    if (index > -1) { //if found
                        users.splice(index, 1);
                    }
                    params['userid'] = users;
                    _createMessage(req, res, params, roomData._id);
                } else {
                    cres.error(res, "No such group exists", {});
                }
            }).catch(err => {
                cres.error(res, err, {});
            })

        } else if (params.user_id) {
            if (req.user._id != params.user_id) {
                // 1. Check if this 2 user has private group or not
                params['userid'] = params.user_id;
                chatRooms.findPrivateGroup(req.user._id, params.user_id).then(group => {
                    if (group) {
                        // 2. if yes then get group data and create message 
                        _createMessage(req, res, params, group.id);
                    } else {
                        // 2. if not then create a group first / with version 
                        chatRooms.createAutoGroup(req, 0, [req.user._id, params.user_id]).then(roomData => {
                            // 3. then add message to Chat Message
                            _createMessage(req, res, params, roomData._id);
                        });
                    }
                }).catch(err => {
                    cres.error(res, err, {});
                })
            } else cres.error(res, "You cant message to your self", {});
        } else cres.error(res, "Please provide user id or group id", {});
    }
}

/**
 * @api {post} /chat/message/readmsg Read Message
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Read Message
 * @apiGroup Chat Messages
 * @apiParam {string}  message_id   Message Id
 */
exports.readMessage = (req, res) => {
    let required_fields = { 'message_id': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.ChatMessage.updateMany({ _id: { $lte: mongoose.Types.ObjectId(params.message_id) } }, { $pull: { unreaduserid: req.user._id } }).then(messagedata => {
            cres.send(res, messagedata, 'Message read successfully');
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

async function _createMessage(req, res, data, room_id) {
    let promises = [];
    let users = [];
    if (Array.isArray(data.userid) == true) { users = JSON.parse(JSON.stringify(data.userid)); }
    else { users.push(JSON.parse(JSON.stringify(data.userid))); }

    let unreaduserid = [];
    let activeuserdata = await getActiveUser(room_id);

    let files = [];
    if (data.files && data.files.length > 0) {
        let filesdata = data.files;
        filesdata.forEach(element => {
            let filedata = { name: common.moveFile(element.name, 'chat/message'), size: element.size, type: element.type }
            files.push(filedata);
        });
    }
    if (users.length > 0) unreaduserid = users.filter((userid) => activeuserdata.findIndex((id) => id === userid) === -1);
    let message = ''; if (data.message) message = data.message;
    promises.push(model.ChatMessage.create({
        message,
        senderid: req.user._id,
        receiverid: data.userid,
        unreaduserid: unreaduserid,
        files,
        room_id,
        type: 1, // <------- Type 0 for Simple message
    }));


    Promise.all(promises).then((returnData) => {
        returnData[0]['sender'] = req.user;
        cres.send(res, returnData[0], 'Message sent successfully');
    }).catch(err => {
        console.log("ERROR============", err);
        cres.error(res, {});
    })
}

async function getActiveUser(room_id) {
    let userids = await model.ActiveUser.find({ room_id: mongoose.Types.ObjectId(room_id) }, { user_id: 1 });
    return [... new Set((userids).map(user => user.user_id.toString()))];
}