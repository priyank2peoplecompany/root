const fs = require('fs');
const path = require('path');
let CryptoJS = require("crypto-js");
let secretKey = 'GYHcLHmk';
const sharp = require('sharp');

/** tmpToOriginal function is used for moving uploaded file from tmp folder to respecative folder  */
exports.tmpToOriginal = (filename, folder, thumb = false) => {
    fs.rename(`server/assets/tmp/${filename}`, `server/assets/uploads/${folder}/${filename}`, () => { });
}


/** Rename File  */
exports.renameFile = (name, newName) => {
    fs.rename(`server/assets/tmp/${name}`, `server/assets/tmp/${newName}`, () => { });
}

/** ensureDirectoryExistence check if directory exists or not if not then create it */
exports.ensureDirectoryExistence = (filePath) => {
    if (fs.existsSync(filePath)) {
        return true;
    }
    //this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(filePath);
}

/** Resize Image */
exports.resizeImage = (fileUrl, dirName,height, width) => {
    let thumb_file = `server/assets/uploads/${dirName}/thumb_${fileUrl}`;
    let file = `server/assets/uploads/${dirName}/${fileUrl}`;
    sharp(file).resize(width, height).toFile(thumb_file, function(err) {
        if(err) console.log("error=========>",err);
        else { return `${dirName}/thumb_${fileUrl}`;}
    });
    return `${dirName}/thumb_${fileUrl}`;
}    

/** removeFile is used for removeing file from the directory */
exports.removeFile = (filename) => {
    if (filename != '' && filename != undefined) {
        fs.unlink(`server/assets/uploads/${filename}`, () => { });
    }
}

/** removeDirectory is used for removing the directory  */
exports.removeDirectory = (directory) => {
    const fse = require('fs-extra')
    fse.remove(directory, err => {
        if (err) return console.error(` Error while removing directory : ${err}`);
        console.log(`${directory} removed successfully`) // It just deleted my entire HOME directory.
    })
}

/** Move Uploaded File to the Directory  */
exports.moveFile = (file, directory, oldImage = null) => {

    if (oldImage) this.removeFile(oldImage);
    if (file != undefined && file != '') {
        const dirname = `server/assets/uploads/${directory}/`;
        this.ensureDirectoryExistence(dirname);
        this.tmpToOriginal(file, `${directory}/`);
        return `${directory}/${file}`;
    }
    return file;
}

/** Move Multiple Uploaded File  to the Directory  */
exports.moveFiles = (files = [], newFiles = [], directory, oldImage = []) => {
    const dirname = `server/assets/uploads/${directory}/`;
    this.ensureDirectoryExistence(dirname);
    newFiles.forEach(file => {
        this.tmpToOriginal(file, `${directory}/`);
        files.push(`${directory}/${file}`);
    });

    oldImage.forEach(element => {
        this.removeFile(element);
    });

    return files;

}


exports.fileName = (name) => {
    return name.split("/").pop(-1);
}

/** generateKey function generate token which is used as authorization */
exports.generateKey = () => {
    var timeStamp = Math.floor(Date.now());
    return CryptoJS.AES.encrypt(timeStamp.toString(), secretKey).toString();
}

/** Used for encrypte the data in crypto aes format */
exports.encryptdata = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), `${process.env.SECRET_KEY}`).toString();
}

/** UniqueName function removed space with dash(-) */
exports.UniqueName = (name) => {
    return name.replace(/\s+/g, '-').toLowerCase();
}

exports.getDayName = () => {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
}

exports.base64extension = (encoded) => {

    let Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { let t = ""; let n, r, i, s, o, u, a; let f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { let t = ""; let n, r, i; let s, o, u, a; let f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); let t = ""; for (let n = 0; n < e.length; n++) { let r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { let t = ""; let n = 0; let r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

    // Decode the string
    let decoded = Base64.decode(encoded);

    // if the file extension is unknown
    let extension = undefined;
    // do something like this
    let lowerCase = decoded.toLowerCase();

    if (lowerCase.indexOf("png") !== -1)
        extension = "png"
    else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
        extension = "jpeg"
    else if (lowerCase.indexOf("gif") !== -1)
        extension = "gif"
    else extension = "jpeg";

    return extension;
}

exports.ValidURL = (s) => {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}

exports.getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.getCurrentTime = (min) => {
    var now = new Date();
    now.setMinutes(now.getMinutes() + min); // timestamp
    return new Date(now); // Date object
}

exports.getMinutesBetweenDates = (startDate, endDate) => {
    let diff = endDate.getTime() - startDate.getTime();
    return Math.abs(Math.ceil(diff / 60000));
}
