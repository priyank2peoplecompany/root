const common = require('../../helpers/common.helper');
/**
 * @api {post} /role/create Create Role
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Create Role
 * @apiGroup Role
 * @apiParam {string} type     Role Type ( admin,Gym Owner,Trainer,User)
 */
exports.CreateRole = (req, res) => {
    let required_fields = { type: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let type_code = common.UniqueName(params.type);
        let condition = { type_code: type_code }
        try {
            model.Role.findOne(condition).exec((err, data) => {
                if (err) cres.error(res, err, {});
                else {
                    if (data) cres.send(res, [], 'Type already exists')
                    else {
                        params['type_code'] = type_code;
                        model.Role.create(params).then(function (roledata) {
                            cres.send(res, roledata, "Role created successfully");
                        }).catch(function (err) {
                            console.log("Error==>", err);
                            cres.error(res, "Error", {});
                        });
                    }
                }
            });
        } catch (error) {
            cres.error(res, error, 'Something went wrong');
        }
    }
}

/**
 * @api {get} /role/list List All Role
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All Role
 * @apiGroup Role
 */
exports.ListRole = (req, res) => {
    model.Role.find({}).exec((err, data) => {
        if (err) cres.error(res, err, {});
        else {
            if (data.length > 0) cres.send(res, data, 'Role List')
            else cres.send(res, [], "No record found");
        }
    });
}