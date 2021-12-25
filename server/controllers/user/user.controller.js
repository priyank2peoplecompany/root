const redis = require('../../helpers/redis.helper');
const bcrypt = require('bcrypt-nodejs');
const common = require('../../helpers/common.helper');
require('dotenv-expand')(require('dotenv').config());
const msg91 = require("msg91")(process.env.API_KEY, process.env.SENDER_ID, process.env.ROUTE_NO);
const upload = require('../../helpers/image-upload.helper').imgFileUpload;

/**
 * @api {post} /user/login User Login
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName User Login
 * @apiGroup User
 * @apiParam {string}       email           Email Id
 * @apiParam {string}       role_id         Role id
 * @apiParam {String}       password        Password
 */
exports.Userlogin = (req, res) => {
    let required_fields = { 'email': 'string', 'role_id': 'string', 'password': 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        model.User.findOne({ email: params.email, role_id: params.role_id }).lean().then(data => {
            if (data && bcrypt.compareSync(params.password, data.password)) {
                delete data.password;
                data['user_type'] = params.role_id;
                maintainRedisAndLog(res, data, true)
            }
            else cres.error(res, 'Please check your email and password', {});
        }).catch(err => {
            cres.error(res, err, {});
        });
    }
}

/**
 * @api {post} /user/sendotp Send OTP
 * @apiName Send OTP
 * @apiGroup User
 * @apiParam {integer}  phone       Phone Number
 * @apiParam {string}   role        User Role
 */
exports.SendOTP = (req, res) => {
    let required_fields = { phone: 'integer', role: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = { phone: params.phone, role_id: params.role };
        this.getUserDetail(condition).then(userData => {
            // 1. Check if user is registered or not
            if (userData) {
                let otp = 0;
                let currenttime = common.getCurrentTime(0);
                let expire_time = userData.user_otp.expire_time;
                let remaining_min = '';
                let attemp = parseInt(userData.user_otp.attemp);
                if (Date.parse(currenttime) > Date.parse(expire_time)) {
                    expire_time = common.getCurrentTime(10);
                    otp = common.getRandom(1000, 9999);
                    remaining_min = 10;
                    attemp = parseInt(0);
                    let message = `${otp} is your one time password to processed on FitApp.It is valid for ${remaining_min} minutes.Do not share you OTP with anyone.`;
                    let user_otp = { role: params.role, expire_time, code: otp, attemp }
                    sendOtpMessage(params, res, user_otp, message, 'update', userData);
                }
                else {
                    if (attemp < 2) {
                        otp = userData.user_otp.code;
                        if (otp == 0) {
                            otp = common.getRandom(1000, 9999);
                            expire_time = common.getCurrentTime(10);
                        }
                        remaining_min = common.getMinutesBetweenDates(expire_time, currenttime);
                        attemp = parseInt(userData.user_otp.attemp) + parseInt(1);
                        let message = `${otp} is your one time password to processed on FitApp.It is valid for ${remaining_min} minutes.Do not share you OTP with anyone.`;
                        let user_otp = { role: params.role, expire_time, code: otp, attemp }
                        sendOtpMessage(params, res, user_otp, message, 'update', userData);
                    }
                    else cres.error(res, "You have reached maximum nymber of request, Please try after sometime", {});
                }
            } else {
                let otp = common.getRandom(1000, 9999);
                let message = `${otp} is your one time password to processed on FitApp.It is valid for 10 minutes.Do not share you OTP with anyone.`;
                let user_otp = { role: params.role, code: otp, expire_time: common.getCurrentTime(10), attemp: 0 }
                sendOtpMessage(params, res, user_otp, message, 'add', '');
            }
        });
    }
}

/**
 * @api {post} /user/validateotp Validate OTP
 * @apiName Validate OTP
 * @apiGroup User
 * @apiParam {integer}  phone       Phone Number
 * @apiParam {integer}  otp         One Time Password
 * @apiParam {string}   role        User Role
 */
exports.ValidateOTP = (req, res) => {
    let required_fields = { phone: 'integer', otp: 'integer', role: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = { phone: params.phone, role_id: params.role };
        this.getUserDetail(condition).then(userData => {
            // 1. Check if user is registered or not
            if (userData) {
                let code = userData.user_otp.code;
                let currenttime = common.getCurrentTime(0);
                let expire_time = userData.user_otp.expire_time;
                if (Date.parse(currenttime) <= Date.parse(expire_time) && code == params.otp) {
                    let user_otp = { role: params.role, code: 0, expire_time: userData.user_otp.expire_time, attemp: 0 }
                    model.User.updateOne({ _id: mongoose.Types.ObjectId(userData._id) }, { $set: { user_otp } }).then(function (udata) {
                        delete userData.password;
                        userData['user_type'] = params.role_id;
                        maintainRedisAndLog(res, userData, false);
                    }).catch(function (err) {
                        console.log("Error==>", err);
                        cres.error(res, "Error", {});
                    });
                }
                else cres.error(res, 'Please check your one time password', {});
            }
            else cres.error(res, 'Please check your phone and role', {});
        });
    }
}

/**
 * @api {post} /user/update Update User 
 * @apiName Update User 
 * @apiGroup User
 * @apiParam {string}       email                   Email Address
 * @apiParam {string}       name                    Name
 * @apiParam {boolean}      is_profile_complete     Is Profile Complete
 * @apiParam {string}       [profile_pic]           Profile Pic
 * @apiParam {string}       [new_profile_pic]       Profile Pic
 * @apiParam {integer}      [gender]                Gender // 0 - Male , 1 - Female , 2 - Other 
 * @apiParam {string}       [birthdate]             Birthdate
 * @apiParam {float}        [height]                Height
 * @apiParam {float}        [weight]                Weight
 */
exports.UpdateUser = (req, res) => {
    let required_fields = {
        email: 'string',
        name: 'string',
        profile_pic: 'optional|string',
        new_profile_pic: 'optional|string',
        address: 'optional|json',
        is_profile_complete: 'boolean',
        gender: 'optional|integer',
        birthdate: 'optional|string',
        height: 'optional|string',
        weight: 'optional|string'
    }
    let params = req.body;

    if (vh.validate(res, required_fields, params)) {
        let condition = { _id: mongoose.Types.ObjectId(req.user._id) }
        this.getUserDetail(condition).then(data => {
            if (data && data._id) {
                params['profile_pic'] = common.moveFile(params.new_profile_pic, 'user', params.profile_pic);
                params['is_online'] = false;
                model.User.updateOne({ _id: mongoose.Types.ObjectId(data._id) }, { $set: params }).then(function (udata) {
                    if (params.profile_pic != undefined && params.profile_pic != '') {
                        params['profile_pic'] = `${process.env.ASSETS_URL}uploads/${params['profile_pic']}`;
                    }
                    params['_id'] = req.user._id;
                    cres.send(res, params, "User updated successfully");
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, "Error", {});
                });
            }
            else cres.send(res, {}, 'Error in updating user profile')
        }).catch(err => {
            cres.error(res);
        });
    }
}

/**
 * @api {get} /user/logout Logout User
 * @apiName Logout User
 * @apiGroup User
 */
exports.UserLogout = (req, res) => {
    redis.deleteKey(req.headers['authorization']).then(data => {
        cres.send(res, [], "User logged out successfully");
    }).catch(err => {
        cres.error(res);
    });
}

/**
 * @api {post} /user/list List User
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List All User
 * @apiGroup User
 * @apiParam {integer}  page        Page Number
 * @apiParam {integer}  limit       Number of record display per page
 * @apiParam {string}   sort        Sort By ( asc or desc )
 * @apiParam {string}   orderby     Order By ( Field Name : _id,created_at,updated_at etc... )
 * @apiParam {string}   [search]    Search By ( Search By name )
 */
exports.ListUser = (req, res) => {
    let required_fields = { page: 'integer', limit: 'integer', sort: 'string', orderby: 'string' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let orderbyfield = params.orderby;
        let sort = -1;
        if (params.sort === 'ascend') sort = 1;
        let sortby = { [orderbyfield]: sort }
        let condition = {};
        if (params.search != "" && params.search != undefined) {
            let searchtxt = params.search;
            condition['name'] = { '$regex': new RegExp("^" + searchtxt, "i") };
        }
        model.User.countDocuments(condition).exec((err, data) => {
            if (err) cres.error(res, err, {});
            else {
                if (data > 0) {
                    let page = params.page;
                    let skip = 0; if (page > 1) { skip = (page - 1) * params.limit }
                    let returndata = { totalrecord: data }
                    model.User.find(condition).sort(sortby).skip(skip).limit(params.limit).lean().then(userdata => {
                        if (userdata.length > 0) {
                            returndata['userdata'] = userdata;
                            cres.send(res, returndata, 'User List')
                        }
                        else cres.send(res, [], 'No record found');
                    }).catch(err => {
                        cres.error(res, err, {});
                    });
                }
                else cres.send(res, [], 'No record found')
            }
        });
    }
}

/**
 * @api {post} /users/byid List User By id
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName List User By id
 * @apiGroup User
 * @apiParam {array}   [ids]    User Ids
 */
exports.ListAllUser = (req, res) => {
    let required_fields = { ids: 'optional|array' }
    let params = req.body;
    if (vh.validate(res, required_fields, params)) {
        let condition = {};
        if (params.ids != undefined) condition['_id'] = { $in: params.ids }
        model.User.find(condition).exec((err, userdata) => {
            if (err) cres.error(res, err, {});
            else {
                if (userdata.length > 0) cres.send(res, userdata, 'User List')
                else cres.send(res, [], 'No record found')
            }
        });
    }
}

/**
 * Get the detail of given Phone Number 
 */
exports.getUserDetail = (condition) => {
    return model.User.findOne(condition)
        .select('-password -created_at -updated_at -deleted')
        .lean({ getters: true });
}

function maintainRedisAndLog(res, data, login) {
    data['socket_id'] = common.generateKey();
    return redis.setKey(data).then(key => {
        data['token'] = key;
        cres.send(res, data, 'Login successfully');
    }).catch(err => {
        console.log('Error===========>', err)
        cres.statusError(res);
    });
}

function sendOtpMessage(params, res, user_otp, message, action, userData = '') {
    msg91.send(params.phone, message, function (err, response) {
        if (err) cres.error(res, err, 'Something went wrong');
        else {
            if (action == 'add') {
                model.User.create({ name: '', email: '', password: '', role_id: params.role, phone: params.phone, user_otp }).then(function (udata) {
                    cres.send(res, udata, "OTP sent successfully on your phone");
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, "Error", {});
                });
            }
            else if (action == 'update') {
                model.User.updateOne({ _id: mongoose.Types.ObjectId(userData._id) }, { $set: { user_otp } }).then(function (udata) {
                    userData['user_otp'] = user_otp;
                    cres.send(res, userData, "OTP sent successfully on your phone");
                }).catch(function (err) {
                    console.log("Error==>", err);
                    cres.error(res, "Error", {});
                });
            }
        }
    })
}

/**
 * @api {post} /file/upload Upload Files
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Upload Files
 * @apiGroup File Upload
 * @apiParam {Array}   files    Feed Photo ( Array of Photos)
 */
exports.UploadFiles = (req, res) => {
    upload(req, res).then(() => {
        let filesdata = req.body.file;
        if (filesdata.length > 0) cres.send(res, filesdata, "File upload successfully");
        else cres.error(res, 'Something went wrong', {});
    }).catch(err => {
        cres.error(res, 'Something went wrong', {});
    })
}
