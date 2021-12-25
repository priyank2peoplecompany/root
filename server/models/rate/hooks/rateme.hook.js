const common = require('../../../helpers/common.helper');
exports.updateAvgRate = (Obj) => {
    
// console.log('condition11===========>', Obj)
// return false;
  
    let condition ={};
    condition['_id'] = Obj ;
    model.Rate.aggregate(
            [
                { $match: condition },
                {$unwind: "$liked_users"} ,
                { 
                    $group : {  _id:"$_id",avg_rate: { $avg: "$liked_users.rate" }}
                }
            ]
    ).exec((err, data) => {
        let params={}
        console.log('====>',data)
        // params.avg_rate = data[0].avg_rate;
        // model.Rate.updateOne({ _id: mongoose.Types.ObjectId('5dd3b08c642fdd6b40206a61') }, { $set: params }).then(function (ratedata) {
            
        // }).catch(function (err) {
        // });
    }); 
        
}

