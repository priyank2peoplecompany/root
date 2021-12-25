const common = require('../../helpers/common.helper');
/**
 * @api {post} /tag/add Create Tag / Update Tag
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Tag / Update Tag
 * @apiGroup Tag
 * @apiParam {string}  tag             Tag Title
 * @apiParam {boolean} enabled         True,False
 */
exports.CreateTag = (req, res) => {
    let required_fields = { tag: 'string', enabled: 'boolean' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let tagcode = common.UniqueName(params.tag)
        model.Tag.findOne({ tagcode: tagcode }).exec((err, tagdata) => {
            if (err) cres.error(res, err, {});
            else {
                if (tagdata) {
                    model.Tag.updateOne(
                        { _id: tagdata._id },
                        { $set: { tag: params.tag, tagcode: tagcode, enabled: params.enabled } },
                        { upsert: true, new: true },
                        function (err, data) {
                            if (err) cres.error(res, "Error in updating tag", err);
                            else cres.send(res, data, "Tag updated successfully");
                        }
                    );
                }
                else {
                    model.Tag.create({ tag: params.tag, tagcode: tagcode, enabled: params.enabled }).then(function (udata) {
                        cres.send(res, udata, "Tag created successfully");
                    }).catch(function (err) {
                        console.log("Error==>", err);
                        cres.error(res, "Error in creating tag", err);
                    });
                }
            }

        });
    }
}


/**
 * @api {get} /tag/list List Tags
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List Tags
 * @apiGroup Tag
 */
exports.ListTags = (req, res) => {
    model.Tag.find({}).exec((err, tagdata) => {
        if (err) cres.error(res, err, {});
        else {
            if (tagdata.length > 0) cres.send(res, tagdata, 'Tags List')
            else cres.send(res, [], 'No record found')
        }
    });
}