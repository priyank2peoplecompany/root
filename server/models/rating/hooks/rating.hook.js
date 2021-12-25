const ioh = require('../../../helpers/socket.helper');
const fs = require('fs');

/**
 * Use : Maintain read flag for other users / send socket notification
 * @param {*} ratingObj    Inserted Object
 */
exports.addToRatingFlag = (ratingObj) => {
    console.log("ratingObj---->", ratingObj);
    let type = ratingObj.type;
    let rating = ratingObj.rating;
    let rating_id = ratingObj.rating_id;
    model.Rating.aggregate([
        { $match: { rating_id: rating_id, type: type } },
        { $group: { _id: 1, count: { $sum: 1 }, total: { $sum: { $add: "$rating" } } } }
    ]).then((returnData) => {
        if (returnData.length > 0) {
            let rating = {
                total: returnData[0].count,
                average: (returnData[0].total / returnData[0].count),
            };
            if (type == 0) {
                model.Gym.updateOne(
                    { _id: mongoose.Types.ObjectId(rating_id) },
                    { $set: { rating: rating } },
                    function (err, adata) {
                        if (err) console.log('Error====>', err);
                        else console.log('Success', adata);
                    }
                )
            }
            else if (type == 1) {
                console.log('update trainer rating')
            }
        }
    }).catch(err => {
        console.log("ERROR============", err);
    })

    // ratingObj.aggregate('sender').execPopulate().then((returnData) => {
    //     receiverid.push(senderid);
    //     console.log("receiverid===========>", receiverid);
    //     ioh.toSpecificUsers(receiverid, 'new-message', { data: returnData.toJSON() });
    //     model.Gym.updateOne(
    //         { _id: mongoose.Types.ObjectId(returnData.room_id) },
    //         { $set: { message_id: returnData._id, lastmessage_date: new Date().getTime() } },
    //         function (err, adata) {
    //             if (err) console.log('Error====>', err);
    //             else console.log('Success', adata);
    //         }
    //     )
    // }).catch(err => {
    //     console.log("ERROR============", err);
    // })
}