const ioh = require('../../helpers/socket.helper');

exports.allRateSocket = (action, user_id, data) => {
    ioh.toAllExceptExecuter(action, user_id, data);
}