const express = require('express');
const bodyParser = require('body-parser');
const app = express(); //, cors = require('cors');
const cors = require('cors')

app.use(bodyParser.json({ limit: '50mb' })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // to support URL-encoded bodies
app.use(cors())

app.set('view engine', 'ejs');
app.use(function (req, res, next) {

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'appid, X-Requested-With,Authorization, X-HTTP-Method-Override, Content-Type, Accept');

    global.baseurl = ' http://' + req.get('host') + '/';
    global.assetspath = process.env.BASE_PATH;

    next();
});

const openApi = require('./server/routes/open.routes');
const authApi = require('./server/routes/auth.routes');
app.use('/api', [...openApi, ...authApi]);

app.use("/apidoc", express.static('apidoc'));
app.use('/uploads', express.static('server/assets/uploads'));
app.use('/assets', express.static('server/assets/'));
app.set('views', './server/templates');

app.get('/', function (req, res) {
    res.send('Are you lost ?');
    res.end();
});

app.get('*', function (req, res) {
    res.send('Are you lost ?');
    res.end();
});

require('dotenv-expand')(require('dotenv').config());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1; //Added for Email SSL Cert issue
const server = require('http').createServer(app);

console.log('Server Created');

// ----------------- START : Socket connection setup ------------------
global.io = require('socket.io')(server);
require('./server/helpers/socket.helper.js').initSockets();
// ----------------- END : Socket connection setup ------------------

server.listen(process.env.PORT, () => {
    console.log('Listening on ', process.env.IP, process.env.PORT);
});

global.mongoose = require('mongoose');
global.Schema = mongoose.Schema;
global.mongoose_delete = require('mongoose-delete');
mongoose.set('debug', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
require('./server/config/config');
global.model = require('./server/models');

/*
This will include helpers we use through out application
*/
global.cres = require('./server/helpers/response.helper.js');
global.vh = require('./server/helpers/validator.helper.js');