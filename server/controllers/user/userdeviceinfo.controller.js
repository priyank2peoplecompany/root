const common = require('../../helpers/common.helper');
/**
 * @api {post} /user/adddeviceinfo Add User Device Informartion
 * @apiName  Add User Device Informartion
 * @apiParam {string}      device_token   Device Token
 * @apiParam {string}      device_type      Device Type (android,ios)
 * @apiParam {string}      uuid             Hardware id of device
 * @apiParam {string}      country_code     Country Code
 * @apiParam {string}      build_version    Build Version
 * @apiParam {string}      devicemodel      Device Model
 * @apiParam {string}      manufacturar     Manufacturar
 * @apiParam {boolean}     isrooted         True/False 
 * @apiParam {string}      [latitude]       Latitude
 * @apiParam {string}      [longitude]      Longitude
 * @apiParam {string}      [language]       Language
 * @apiGroup User
 */
exports.addDeviceInfo = (req, res) => {

    let required_fields = {
        'device_token': 'string',
        'uuid': 'string',
        'device_type': 'string',
        'build_version': 'string',
        'country_code': 'string',
        'devicemodel': 'string',
        'manufacturar': 'string',
        'latitude': 'optional|string',
        'longitude': 'optional|string',
        'language': 'optional|string',
        'isrooted': 'boolean',
    }

    let params = req.body;

    if (vh.validate(res, required_fields, params)) {

        let location = {};
        if (!params.latitude && !params.longitude) location = { type: 'Point', coordinates: [params.longitude, params.latitude] }

        model.UserDeviceInfo.findOne(
            { uuid: params.uuid },
            function (err, data) {
                if (err) cres.error(res, "Error in adding device informatiom", {});
                else {
                    if (data && data._id) {
                        model.UserDeviceInfo.updateOne(
                            { _id: mongoose.Types.ObjectId(data._id) },
                            {
                                $set: {
                                    devicetoken: params.device_token, devicetype: params.device_type, uuid: params.uuid,
                                    longitude: params.longitude, latitude: params.latitude, build_version: params.build_version, country_code: params.country_code.toLowerCase(),
                                    user_id: req.user._id, devicemodel: params.devicemodel, manufacturar: params.manufacturar, isrooted: params.isrooted,
                                    language: params.language, created_at: Date.now(), last_active: Date.now()
                                }
                            },
                            function (err, resultdata) {
                                if (err) {
                                    console.log("Error=======", err);
                                    cres.error(res, "Error in adding device information", {});
                                }
                                else cres.send(res, resultdata, "Device information data added successfully", {});
                            }
                        );
                    }
                    else {
                        let insdata = {
                            location, devicetoken: params.device_token, devicetype: params.device_type, longitude: params.longitude,
                            latitude: params.latitude, build_version: params.build_version, country_code: params.country_code.toLowerCase(),
                            user_id: req.user._id, devicemodel: params.devicemodel, manufacturar: params.manufacturar,
                            isrooted: params.isrooted, uuid: params.uuid, language: params.language,
                            created_at: Date.now(), last_active: Date.now(), deleted: false
                        }
                        model.UserDeviceInfo.create(insdata).then(resultdata => {
                            cres.send(res, resultdata, "Device information data added successfully", {});
                        }).catch(err => {
                            console.log('Error=====>', err);
                            cres.error(res, "Error in auto login", {});
                        });
                    }
                }
            })
    }
}

/**
 * @api {post} /pushnotification/sendpushnotification Send Notification
 * @apiHeader {Authorization} Authorization Users unique access-key.
 * @apiName Send Notification
 * @apiGroup Notification
 * @apiParam {String}       target_user          Register,Guest,All etc..
 * @apiParam {String}       devicetype           android,ios,All
 * @apiParam {String}       title                Push Notification Title
 * @apiParam {String}       message              Push Notification Message
 * @apiParam {String}       image                Push Notification Image
 * @apiParam {String}       data                 Push Notification Data // For Link navigation
 * @apiParam {String}       dataType             Push Notification Data Type // For Link navigation
 * @apiParam {Boolean}      environment          Two Types of environment ( true or false )
 * @apiParam {Boolean}      silent               True or False (Default false) Used for sending silent notification
 * @apiParam {String}       [expirationTime]     Push notification expiration time
 * @apiParam {String}       notification_type    Simple,Schedule,Geofence,Georegion,Auto Push etc..
 * @apiParam {String}       notification_data    Pass Json Data 
 */
exports.sendpushnotification = (req, res) => {
    let required_fields = {
        "devicetype": "string",
        "title": "string",
        "environment": "boolean",
        "message": "string",
        "notification_type": "string",
        "notification_data": "optional|json",
    }
    let params = req.body;
    console.log("params========>", params);
    if (vh.validate(res, required_fields, params)) {
        console.log('HERER');
        params.environment = params.environment ? 'development' : 'production';

        params['userid'] = req.user._id;
        if (params.image) {
            let image = common.fileName(params.image);
            common.tmpToOriginal(image, 'pushnotification');
            params['image'] = `uploads/pushnotification/${image}`;
        }
        if (params.notification_type == 'schedule') params['status'] = 'Pending';
        params['devicetype'] = params.devicetype.toLowerCase();
        model.Pushnotification.create(params).then(result => {
            switch (params.notification_type) {
                case 'schedule_later':
                    let dateFormat = moment(params.notification_data.date_time).format("YYYY-MM-DD HH:mm:ss");
                    cres.send(res, { 'id': result._id }, "Pushnotification will be sent on " + dateFormat);
                    break;
                case 'geofence':
                    cres.send(res, { 'id': result._id }, "Pushnotification saved successfully");
                    break;
                case 'georegion':
                    cres.send(res, { 'id': result._id }, "Pushnotification saved successfully");
                    break;
                case 'auto_push':
                    cres.send(res, { 'id': result._id }, "Pushnotification saved successfully");
                    break;
                default:
                    sendNotification(res, params, req.user._id);
                    break;
            }
        }).catch(err => {
            console.log('Error=====>', err);
            cres.error(res, "Error in adding pushnotification--->" + err, {});
        });

    }
}

// This function is used for the sending notification to mobile devices
async function sendNotification(res, notificationData, userid) {
    let error = [];
    let condition = { admin_id: userid };
    if (notificationData.target_user.toLowerCase() == 'register') condition['user_id'] != 0;
    if (notificationData.target_user.toLowerCase() == 'guest') condition['user_id'] == 0;

    let userNotificationData = await model.UserDeviceInfo.find(condition);
    let type = notificationData.environment;
    for (let deviceData of userNotificationData) {
        if (deviceData.devicetype == 'ios' && (notificationData.devicetype.toLowerCase() == 'ios' || notificationData.devicetype.toLowerCase() == 'all')) {
            common.IosNotification(notificationData, deviceData);
            // await common.getNotificationUserSettings(type, 'ios', userid).then(async (sdata) => {
            //     if (sdata) common.IosNotification(notificationData, deviceData, sdata);
            //     else error.push('Please add your notification setting first to send notification');
            // });
        }
        else if (deviceData.devicetype == 'android' && (notificationData.devicetype.toLowerCase() == 'android' || notificationData.devicetype.toLowerCase() == 'all')) {
            common.AndroidNotification(notificationData, deviceData);
        }
    }
    if (error.length > 0) cres.error(res, "Error", error);
    else cres.send(res, {}, "Pushnotification has been sent");
}