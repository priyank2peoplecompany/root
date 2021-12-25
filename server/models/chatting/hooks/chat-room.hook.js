const ioh = require('../../../helpers/socket.helper');
const common = require('../../../helpers/common.helper');

/**
 * Use : Maintain read flag for other users / send socket notification
 * @param {*} chatRoomObj    Inserted Object
 */
exports.addToChatRoomFlag = (Obj) => {
    let users = Obj.users;
    let index = users.indexOf(Obj.created_by);
    if (index > -1) users.splice(index, 1);
    Obj.users = users;

    newGroupMessage(Obj);
    newUserMessage(Obj);
}
/**
 * Use : Notify users that removed from the group
 * @param {*} group_id      Added in Group ID 
 * @param {*} payload       Extra Params 
 */
function removeGroup(chatGroup, payload) {

    setTimeout(function () {
        let group_id = chatGroup.id;
        model.ChatGroupUser.destroy({
            where: { group_id: group_id },
            returning: true,
            force: true,
            hooks: false
        }).then((rows) => {
            if (rows) {
                model.ChatMessage.destroy({
                    where: { group_id: group_id },
                    individualHooks: true,
                    user: req.user,
                    //socket:false, 
                }).then((rows) => {
                    cres.send(res, {}, " Message Deleted Successfully");
                });

                ioh.toSpecificUser(rows.user_id, 'Clear-All', { group_id, payload });
            }
        });
    }, 1000);
}

//Created new group system message
function newGroupMessage(chatRoomObj) {
    model.User.findOne({ _id: mongoose.Types.ObjectId(chatRoomObj.created_by) }, { name: 1 }).then((userdata) => {
        if (userdata) {
            let messageObj = {
                room_id: chatRoomObj._id, senderid: chatRoomObj.created_by,
                message: `${userdata.name} created ${chatRoomObj.name} group`,
                receiverid: chatRoomObj.users, type: 0
            }
            model.ChatMessage.create(messageObj);
        }
    }).catch(err => {
        console.log("ERROR============", err);
    })
}

// Add new user in group system message
function newUserMessage(chatRoomObj) {
    model.User.findOne({ _id: mongoose.Types.ObjectId(chatRoomObj.created_by) }, { name: 1 }).then((loginuserdata) => {
        if (loginuserdata) {
            let createdby = `${loginuserdata.name} ${loginuserdata.name}`;
            model.User.find({ _id: { $in: chatRoomObj.users } }, { name: 1 }).then((userdata) => {
                if (userdata.length > 0) {
                    let username = [];
                    username.push(userdata.map(element => (`${element.name}`)));
                    if (username.length > 0) {
                        let user = username.join(',');
                        let message = `${createdby} added ${user} to this conversation`;
                        let messageObj = {
                            room_id: chatRoomObj._id, senderid: chatRoomObj.created_by,
                            message: message, receiverid: chatRoomObj.users, type: 0
                        }
                        console.log("INSIDE NEW USER MESSAGE==>", messageObj);

                        model.ChatMessage.create(messageObj);
                    }
                }
            }).catch(err => {
                console.log("ERROR============", err);
            })
        }
    }).catch(err => {
        console.log("ERROR============", err);
    })
}