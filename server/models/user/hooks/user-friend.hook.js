const ioh = require('../../../helpers/socket.helper');
/**
 * Use : Maintain read flag for other users / send socket notification
 * @param {*} chatRoomObj    Inserted Object
 */
exports.sendFriendRequest = (Obj) => {
    let receiverid = Obj.receiver;
    model.User.findOne({ _id: receiverid }, { name: 1, email: 1, phonme: 1 }).then((userdata) => {
        if (userdata) ioh.toSpecificUser(receiverid, 'get-friend-request', { data: userdata });
    }).catch(err => {
        console.log("ERROR============", err);
    })
}
