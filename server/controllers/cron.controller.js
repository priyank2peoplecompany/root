const common = require('./../helpers/common.helper');
const moment = require('moment');
var CronJob = require('cron').CronJob;
// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11
// Day of Week: 0-6

new CronJob({
    cronTime: '*/60 * * * * *', // called every 5 secs
    onTick: () => {
        // console.log('Every Second - Cron is running');        
        SchedulePushnotification();
        GeoregionPushnotification();
        AutoPushnotification();
        udatePublishLogStatus();
    },
    start: (process.env.CRON_STATUS == 'true')
});

new CronJob({
    cronTime: '*/3600 * * * * *', // called every 1 hour
    onTick: () => {
        //console.log('Every Hour - Cron is running');
        udateAnalyticsData();
    },
    start: (process.env.CRON_STATUS == 'true')
});

new CronJob({
    cronTime: '0 0 0 * * *', //will run every day at 12:00 AM
    onTick: () => {
       
        udateAnalyticsData();
    },
    start: (process.env.CRON_STATUS == 'true')
});


async function cronRatemeTrending() {    
   
     //condition = {'liked_users.created_at': {$gte: new Date((new Date().getTime() - (30 * 24 * 60 * 60 * 1000)))}}
    var date = new Date();
    model.Rate.aggregate(
            [
                {
                    $project: {
                        liked_users: {
                            $filter: {
                                input: "$liked_users", as: "liked", 
                                cond: { $gte: ["$$liked.created_at", new Date(date.setMonth(date.getMonth()-1))] }
                            }
                        }
                    }
                },
                {$unwind: "$liked_users"} ,
                { 
                    $group : {  _id:"$_id",total_rate: { $sum: "$liked_users.rate" }}
                }
            ]
        ).exec((err, data) => {
            
        if (err) cres.error(res, err, {});
        else {
            if (data.length > 0) {
                let trending=[];
                for(let i=0; i<data.length;i++){
                    trending.push({'rate_id':data[i]._id, 'total_rate': data[i].total_rate});
                }
                model.RatemeTrending.create(trending).then(function (ratedata) {
                    cres.send(res, data, 'Rate List'); 
                }).catch(function (err) {
                    cres.error(res, "Error", err);
                }); 
            }
            else {
                cres.send(res, [], "No record found");
            }
        }
    }); 
}

async function SchedulePushnotification() {
    let currentDatetime = moment().seconds(0).milliseconds(0).toISOString();
    model.Pushnotification.find({ 'notification_type': 'schedule_later', "notification_data.date_time": { $gte: currentDatetime } }).then(async (data) => {
        if (data && data.length > 0) {
            for (let notificationData of data) {
                let scheduleDateTime = moment(notificationData.notification_data.date_time).seconds(0).milliseconds(0).toISOString();
                if (scheduleDateTime === currentDatetime) {
                    let userid = notificationData.userid;
                    let condition = { admin_id: userid, devicetoken: { $ne: null }, };
                    if (notificationData.target_user != 'all') {
                        let cond = await targetUser(notificationData.target_user);
                        condition = { admin_id: userid, devicetoken: { $ne: null }, ...cond };
                    }
                    let project = { _id: 0, devicetoken: 1, devicetype: 1 };
                    sendNotification(notificationData, condition, project);
                }
            }
        }
    });
}

async function GeoregionPushnotification() {
    let currentDatetime = moment().seconds(0).milliseconds(0).toISOString();
    model.Pushnotification.find({ 'notification_type': 'georegion', "notification_data.date_time": { $gte: currentDatetime } }).then(async (data) => {
        if (data && data.length > 0) {
            for (let notificationData of data) {
                let scheduleDateTime = moment(notificationData.notification_data.date_time).seconds(0).milliseconds(0).toISOString();
                if (scheduleDateTime === currentDatetime) {
                    let locationdata = notificationData.notification_data.location;
                    let userid = notificationData.userid;
                    for (let element of locationdata) {
                        let condition = { admin_id: userid, devicetoken: { $ne: null }, location: { $near: { $geometry: { type: "Point", coordinates: [element.lng, element.lat] }, $maxDistance: element.radius } } };
                        if (notificationData.target_user != 'all') {
                            let cond = await targetUser(notificationData.target_user);
                            condition = { admin_id: userid, devicetoken: { $ne: null }, location: { $near: { $geometry: { type: "Point", coordinates: [element.lng, element.lat] }, $maxDistance: element.radius } }, ...cond };
                        }
                        console.log("Geo Region Notification================>", condition);
                        let project = { uuid: 1, devicetoken: 1, devicetype: 1, admin_id: 1, user_id: 1 }
                        sendNotification(notificationData, condition, project);
                    }
                }
            }
        }
    });

}

async function AutoPushnotification() {
    let currentDatetime = moment().seconds(0).milliseconds(0).toISOString();
    model.Pushnotification.find({ 'notification_type': 'auto_push', "notification_data.end_on": { $gte: currentDatetime } }).then(async (data) => {
        if (data && data.length > 0) {
            let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            let dayName = days[new Date().getDay()];
            for (let notificationData of data) {
                let endDateTime = moment(notificationData.notification_data.end_on).seconds(0).milliseconds(0).toISOString();
                if (endDateTime >= currentDatetime) {
                    let userid = notificationData.userid;
                    let condition = { admin_id: userid, devicetoken: { $ne: null } };
                    if (notificationData.target_user != 'all') {
                        let cond = await targetUser(notificationData.target_user);
                        condition = { admin_id: userid, devicetoken: { $ne: null }, ...cond };
                    }
                    console.log("Auto Push Notification================>", condition);
                    let project = { uuid: 1, devicetoken: 1, devicetype: 1, admin_id: 1, user_id: 1 }
                    let repeat = notificationData.notification_data.repeat_on;
                    let currentTime = moment().format('HH:MM');
                    let repeattime = moment(notificationData.notification_data.time).format('HH:MM');
                    let repeat_data = notificationData.notification_data.repeat_data;
                    switch (repeat) {
                        case 'daily':
                            if (currentTime === repeattime) sendNotification(notificationData, condition, project);
                            break;
                        case 'weekly':
                            let index = repeat_data.indexOf(dayName);
                            if (index >= 0 && currentTime === repeattime) sendNotification(notificationData, condition, project);
                            break;
                        case 'monthly':
                            let isdatematch = await checkDates(repeat_data, endDateTime);
                            if (isdatematch == true && currentTime === repeattime) sendNotification(notificationData, condition, project);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    });
}

async function sendNotification(notificationData, condition, project) {
    console.log("==================Send Notification==================");
    let userid = notificationData.userid;
    let userNotificationData = await model.UserDeviceInfo.find(condition, project);
    let type = notificationData.environment;
    if (userNotificationData && userNotificationData.length > 0) {
        for (let deviceData of userNotificationData) {
            if (deviceData.devicetype == 'ios' && (notificationData.devicetype.toLowerCase() == 'ios' || notificationData.devicetype.toLowerCase() == 'all')) {
                await common.getNotificationUserSettings(type, 'ios', userid).then(async (sdata) => {
                    if (sdata) common.IosNotification(notificationData, deviceData, sdata);
                });
            }
            else if (deviceData.devicetype == 'android' && (notificationData.devicetype.toLowerCase() == 'android' || notificationData.devicetype.toLowerCase() == 'all')) {
                common.AndroidNotification(notificationData, deviceData);
                // await common.getNotificationUserSettings(type, 'android', userid).then(async (sdata) => {
                //     if (sdata) common.AndroidNotification(notificationData, deviceData, sdata.android_key);
                // });
            }
        }
    }
}

async function checkDates(data, date) {
    let today = new Date().getDate();
    let index = data.indexOf(today);
    if (index >= 0) {
        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let newdate = `${month}-${today}-${year}`;
        let dd = moment(new Date(newdate)).seconds(0).milliseconds(0).toISOString()
        if (dd <= date) return true;
        else return false;
    } else return false;
}

async function targetUser(target_user) {
    let condition = {};
    let beforedate = new Date(new Date() - (5 * 24 * 60 * 60 * 1000));
    switch (target_user) {
        case 'registered':
            condition = { user_id: { $ne: 0 } };
            break;
        case 'guest':
            condition = { user_id: { $eq: 0 } };
            break;
        case 'inactive':
            condition = { last_active: { $gt: beforedate } };
            break;
        case 'active':
            condition = { last_active: { $lt: beforedate } };
            break;
        default:
            break;
    }

    return condition;
}

function udatePublishLogStatus() {

    let now = new Date();
    let currenttime = new Date(now.getTime() - (2 * 1000 * 60 * 60));
    let condition = {
        // build_type  :   'Live',
        // app_type    :   'ios',
        status: 'pending',
        updated_at: { $lte: currenttime }
    }
    model.PublishLog.updateMany(
        condition,
        { $set: { status: 'Failed', error_file: `uploads/apps/cron_error.txt` } },
        function (err, data) {
            if (err)
                console.log("Error==>", err);
            else {
                console.log("Publish log updated successfully");
            }
        }
    );
}

function udateAnalyticsData() {

    model.UserDeviceInfo.aggregate([
        { $group: { _id: '$admin_id' } }
    ]).then(async data => {
        if (data) {
            let totdata = data.length;
            for (let i = 0; i < totdata; i++) {
                let admin_id = data[i]._id;
                let returndata = {}

                returndata['countrydata'] = await common.getGroupbylist('$country_code', admin_id);
                returndata['devicemodeldata'] = await common.getGroupbylist('$devicemodel', admin_id);
                returndata['manufacturardata'] = await common.getGroupbylist('$manufacturar', admin_id);
                returndata['versionwisedata'] = await common.getGroupbylist('$build_version', admin_id);
                returndata['inactiveuser'] = await common.getInactiveUser(admin_id);
                model.Analyticsreport.findOneAndUpdate(
                    { admin_id: admin_id },
                    { $set: { reporttype: 'alldatacount', reportdata: returndata } },
                    { upsert: true, new: true },
                    function (err, result) {
                        if (err) console.log("Error=======", err);
                        else console.log('report created successfully');
                    }
                );
            }
        }
    }).catch(err => {
        console.log("Error======>", err);
    });
}