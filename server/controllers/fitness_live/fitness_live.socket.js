const ioh = require('../../helpers/socket.helper');

exports.allFitnessliveSocket = (action, user_id, data) => {
    ioh.toAllExceptExecuter(action, user_id, data);
}