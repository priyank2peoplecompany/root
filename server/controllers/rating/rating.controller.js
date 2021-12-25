const common = require('../../helpers/common.helper');
/**
 * @api {post} /rating/add Add Rating
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Add Rating
 * @apiGroup Rating
 * @apiParam {string}   rating_id   Rating Id ( gym_id | rating_id one of them is mandatory )
 * @apiParam {string}   type        Rating Type (0 - Gym , 1 - Trainer)
 * @apiParam {string}   rating      Rating
 * @apiParam {string}   message     Message 
 * @apiParam {array}    [files]     Send Multiple Files
 */
exports.addRating = (req, res) => {
    let required_fields = {
        'rating_id': 'string',
        'type': 'string',
        'rating': 'string',
        'message': 'optional|string',
        'files': 'optional|array'
    }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        params['user_id'] = req.user._id;
        params['files'] = common.moveFiles(params.files, 'rating');
        model.Rating.create(params).then(function (ratingdata) {
            cres.send(res, ratingdata, "Rating added successfully");
        }).catch(function (err) {
            cres.error(res, "Error", err);
        });
    }
}

/**
 * @api {post} /rating/list List Rating
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Rating
 * @apiGroup Rating
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : title,_id,created_at etc... )
 * @apiParam {string}   id          Gym id or Trainer Id
 * @apiParam {string}   type        0 - Gym , 1- Trainer
 */
exports.ListRating = (req, res) => {
    let required_fields = { page: 'integer', limit: 'integer', sort: 'string', orderby: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        console.log("PARAMS===============>", params);

        let orderbyfield = params.orderby;
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        let condition = { 'rating_id': params.id, 'type': params.type };
        model.Rating.countDocuments(condition).exec((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data > 0) {
                    let page = params.page;
                    let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                    let returndata = { totalrecord: data }
                    model.Rating.find(condition).
                        populate({ path: 'created_by', select: { _id: 1, name: 1 } }).
                        sort(sortby).
                        skip(skip).
                        limit(params.limit).
                        exec((err, ratingdata) => {
                            if (err) cres.error(res, err, {});
                            else {
                                if (ratingdata.length > 0) {
                                    returndata['ratingdata'] = ratingdata;
                                    cres.send(res, returndata, 'Rating List')
                                }
                                else cres.send(res, [], 'No record found')
                            }
                        });
                }
                else cres.send(res, [], 'No record found')
            }
        });
    }
}
