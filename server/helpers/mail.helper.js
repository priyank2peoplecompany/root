var path = require('path');
var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates').EmailTemplate

// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'zaptest09@gmail.com', // Your email id
//         pass: 'temp123#' // Your password
//     }
// });

var transporter = nodemailer.createTransport({
    host: "email-smtp.eu-west-1.amazonaws.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    auth: {
      user: 'AKIAIA524N7PAZWABXMA', // generated ethereal user
      pass: 'Aof8HHBRFfziBIiPvCYOiSHC9B3YS7wgh3OspAw8xLna' // generated ethereal password
    }
});


/**
 * Function will send the mail 
 * 
 * data :
 * {
 *      from : mail-id
 *      to : mail-id
 *      subject : Mail Subject
 *      template : email template name
 *      temp_data : ( JSON ) dynamic data that will be rendered 
 * }
 */
exports.sendMail = (data) => {

    data.temp_data['web_url'] = process.env.WEB_URL;
    var templateDir = path.join(__dirname, '../templates/email', data.template)
    
    var mailTemplate = new EmailTemplate(templateDir);
    
    return mailTemplate.render(data.temp_data).then(result => {
        var mailOptions = {
            from: 'noreply@builderfly.com', // sender address
            to: data.to ? data.to : 'vivek.d@zaptechsolutions.com', // list of receivers
            subject: data.subject ? data.subject : 'Email Example', // Subject line
            html: result.html // You can choose to send an HTML body instead
        };
        console.log("mailOptions==========>",mailOptions);       
        return transporter.sendMail(mailOptions);
    }).catch(err => {
        return Promise.reject(err);
    });

}


/**
 * Function will send the mail with attachment
 * 
 * data :
 * {
 *      from : mail-id
 *      to : mail-id
 *      subject : Mail Subject
 *      template : email template name
 *      temp_data : ( JSON ) dynamic data that will be rendered 
 * }
 */
exports.sendAttachmentMail = (data) => {

    var templateDir = path.join(__dirname, '../templates/email', data.template)
    var mailTemplate = new EmailTemplate(templateDir);
    
    return mailTemplate.render(data.temp_data).then(result => {
        var mailOptions = {
            from: 'noreply@builderfly.com', // sender address
            to: data.to ? data.to : 'priyank@zaptechsolutions.com', // list of receivers
            subject: data.subject ? data.subject : 'Email Example', // Subject line
            html: result.html, // You can choose to send an HTML body instead
            attachments: [
                {   
                    path: 'server/assets/androiddata.json'
                }                
            ]
        };
        console.log("mailOptions==========>",mailOptions);       
        return transporter.sendMail(mailOptions);
    }).catch(err => {
        console.log(err);        
        return Promise.reject(err);
    });

}

