const ioh = require('../../../helpers/socket.helper');
/**
 * Use : Maintain read flag for other users / send socket notification
 * @param {*} chatMessageObj    Inserted Object
 */
exports.addToChatMessageFlag = (chatMessageObj) => {
    let receiverid = chatMessageObj.receiverid;
    let senderid = chatMessageObj.senderid;
    if (receiverid.length > 0) {
        chatMessageObj.populate('sender').execPopulate().then((returnData) => {
            receiverid.push(senderid);
            console.log("receiverid===========>", receiverid);
            ioh.toSpecificUsers(receiverid, 'new-message', { data: returnData.toJSON() });
            if (chatMessageObj.unreaduserid.length > 0) {
                updateUnreadUser(chatMessageObj.unreaduserid, returnData.room_id, chatMessageObj._id);
            }
            model.ChatRoom.updateOne(
                { _id: mongoose.Types.ObjectId(returnData.room_id) },
                { $set: { message_id: returnData._id, lastmessage_date: new Date().getTime() } },
                function (err, adata) {
                    if (err) console.log('Error====>', err);
                    else console.log('Success', adata);
                }
            )
        }).catch(err => {
            console.log("ERROR============", err);
        })
    }
}


function updateUnreadUser(data, room_id, id) {
    data.forEach(element => {
        model.ChatMessage.aggregate([
            { $match: { unreaduserid: { $elemMatch: { $eq: mongoose.Types.ObjectId(element) } } } },
            { $group: { _id: '$room_id', count: { $sum: 1 } } }
        ]).exec((err, roomdata) => {
            if (err) console.log('error========>', err);
            else {
                model.User.updateOne({ _id: element }, { $set: { unread: roomdata.length } }).then((userdata) => {
                    ioh.toSpecificUser(element, 'total-room-unread', roomdata.length);
                }).catch(err => {
                    console.log("ERROR============", err);
                })
            }
        });
    });
}