const redis = require('./redis.helper');

// --------------------------------- Socket : Fire Events ---------------------------------

// send to to all
exports.toAll = (action, data) => {
    io.emit(action, data);
}

// send to to all except executer
// exports.toAllExceptExecuter = (action, data) => {
//     let rooms = getAllRooms(data.user._id);
//     rooms.forEach(room => {
//         io.in(room).emit(action, data);
//     });
// }

//send to to all except executer 
exports.toAllExceptExecuter = (action, user_id, data) => {
    let rooms = getAllRooms(user_id);
    console.log("-------------", action, "-------------", data);
    rooms.forEach(room => {
        io.in(room).emit(action, data);
    });
}

// send to the executer
exports.toExecuter = (action, data) => {
    io.in(`user-${data.user._id}`).emit(action, data);
}

// send to specific users
exports.toSpecificUsers = (user_ids = [], action, data) => {
    user_ids.forEach(user_id => {
        console.log(`-------------------> user-${user_id}`, action, data);
        io.in(`user-${user_id}`).emit(action, data);
    })
}

// send to specific users
exports.toSpecificUser = (user_id, action, data) => {
    console.log(`-------------------> user-${user_id}`, action, data);
    io.in(`user-${user_id}`).emit(action, data);
}

// send to specific users
exports.checkIfRoomAvail = (user_id) => {
    return io.sockets.adapter.rooms[`user-${user_id}`].length;
}

exports.checkIfRoomsAvail = (user_ids) => {

}

// --------------------------------- Socket : Fire Events ---------------------------------


// --------------------------------- Socket : Helper Functions ---------------------------------

exports.formatResponse = (modelObj, payload) => {
    return { data: modelObj.toJSON(), user: payload.user };
}

/**
 * getAllRooms
 * @param {*} except_id    Pass the room id , return all the rooms except that
 *                          If its blank will return all the rooms
 */
function getAllRooms(except_id = '') {
    let rooms = Object.keys(io.sockets.adapter.rooms);
    return rooms.filter(room => {
        return room.includes("user-") && room != `user-${except_id}`;
    });
}

exports.initSockets = () => {

    io.use((socket, next) => {
        if (socket.handshake.query.token) {
            let key = socket.handshake.query.token;
            redis.getKey(key).then(data => {
                if (data) {
                    socket['user'] = data;
                    next();
                } else
                    next(new Error('authentication error'));
            });
        }
        next(new Error('authentication error'));
    })

    io.on('connection', (socket) => {

        // console.log("------------------> User Connected" , socket.user );

        socket.emit('connected', socket.id);

        socket.join(`user-${socket.user._id}`, () => {
            console.log('---------------------- Joining -----------------', socket.user._id, socket.id);
            // Code to notify user is online 
            let user_sockets = io.sockets.adapter.rooms[`user-${socket.user._id}`].length;
            console.log(user_sockets);
            if (user_sockets === 1) {
                //model.User.update({ 'is_online': true, 'login_update': db.sequelize.fn('NOW') }, { where: { id: socket.user._id, 'is_online': false }, individualHooks: true });
                model.User.updateOne(
                    { _id: mongoose.Types.ObjectId(socket.user._id), 'is_online': false },
                    { $set: { 'is_online': true } },
                    function (err, result) {
                        if (err) console.log("Error=======", err);
                        else {
                            console.log('----------------- User gone online -------------', result);
                        }
                    }
                );
            }
            this.toAll('user-online', { user: socket.user });
            // let rooms = Object.keys(socket.rooms);
            // console.log(rooms); // [ <socket.id>, 'room 237' ]
            // this.toAll('wow' , {data : 'asdfsdfasdf'})
        });

        socket.on("disconnect", () => {
            // To notify user gone offline 

            console.log('-------------------- Disconnecting --------------', socket.user._id);

            model.ActiveUser.deleteOne({ socket_id: socket.user.socket_id },
                function (err, result) {
                    if (err) console.log("Error=======", err);
                    else console.log('----------------- Active user removed -------------', result);
                }
            );
            // -------------------- Setting timeout to not update on socket re-connection -------------------- 
            setTimeout(() => {
                if (io.sockets.adapter.rooms[`user-${socket.user._id}`] === undefined) {
                    // model.User.update({ 'is_online': false, 'login_update': db.sequelize.fn('NOW') }, { where: { id: socket.user._id, 'is_online': true }, individualHooks: true }).then(data => {
                    //     if (+data[0]) {
                    //         console.log('----------------- User gone offline -------------');
                    //         this.toAll('user-offline', { user: socket.user });
                    //     }
                    // });
                    model.User.updateOne({ id: mongoose.Types.ObjectId(socket.user._id), 'is_online': true }, { $set: { 'is_online': false, 'login_update': Date.now } },
                        function (err, result) {
                            if (err) console.log("Error=======", err);
                            else console.log('----------------- User gone offline -------------', result);
                        }
                    );
                    this.toAll('user-offline', { user: socket.user });
                }
            }, 1000);
            // -------------------- Setting timeout to not update on socket re-connection -------------------- 

        })

        socket.on("user-typing", (data) => {
            // To notify user gone offline
            let socketdata = {
                group_id: data.group_id,
                typing: data.typing
            }
            this.toSpecificUsers(data.users, 'user-typing-event', { data: socketdata, user: socket.user });
        })

        socket.on("room-join", (data) => {

            console.log("socket.user=======>");

            model.ActiveUser.findOneAndUpdate(
                { socket_id: socket.user.socket_id },
                { room_id: data._id, user_id: socket.user._id },
                { upsert: true },
                function (err, result) {
                    if (err) console.log("Error=======", err);
                    else console.log('----------------- User joined room -------------', result);
                }
            );

            model.ChatMessage.aggregate([
                { $match: { unreaduserid: { $elemMatch: { $eq: mongoose.Types.ObjectId(socket.user._id) } } } },
                { $group: { _id: '$room_id', count: { $sum: 1 } } }
            ]).exec((err, roomdata) => {
                if (err) console.log('error========>', err);
                else {
                    model.User.updateOne({ _id: socket.user._id }, { $set: { unread: roomdata.length } }).then((userdata) => {
                        this.toSpecificUser(socket.user._id, 'total-room-unread', roomdata.length);
                    }).catch(err => {
                        console.log("ERROR============", err);
                    })
                }
            });



            model.ChatMessage.updateMany({ room_id: mongoose.Types.ObjectId(data._id) }, { $pull: { unreaduserid: socket.user._id } }).exec((err, messagedata) => {
                if (err) console.log('Error---------->', err);
                else {
                    if (messagedata) {
                        console.log('Message read successfully----->', messagedata);

                    }
                }
            });

        })

        socket.on("room-leave", () => {
            model.ActiveUser.deleteOne({ socket_id: socket.user.socket_id },
                function (err, result) {
                    if (err) console.log("Error=======", err);
                    else console.log('----------------- Active user removed -------------', result);
                }
            );
        })

        // dummy action to check socket connection
        socket.on("send_lat_long", (data) => {
            console.log(data);
        });

        // socket.emit('testing_socket', "Nothing");
    });
}

// --------------------------------- Socket : Helper Functions ---------------------------------