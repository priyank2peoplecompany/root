const ioh = require('../../helpers/socket.helper');

exports.allCommunitySocket = (action, user_id, data) => {
    ioh.toAllExceptExecuter(action, user_id, data);
}