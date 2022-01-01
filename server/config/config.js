const DB_DETAILS = {
	"local": {
		"db_host": "localhost",
		"db_name": "root",
		"db_username": "root_db_user",
		"db_passoword": "CV\L#4\?^qQ-aj7g",
		"db_dialect": "",
		"multipleStatements": true
	},
	"development": {
		"db_host": "localhost",
		"db_name": "root",
		"db_username": "root_db_user",
		"db_passoword": "",
		"db_dialect": "",
		"multipleStatements": true
	},
	"production": {
		"db_host": "localhost",
		"db_name": "",
		"db_username": "",
		"db_passoword": "",
		"db_dialect": "",
		"multipleStatements": true
	}
}

const env_db = DB_DETAILS[process.env.NODE_ENV];

//mongoose.connect(`mongodb+srv://${env_db.db_username}:${env_db.db_password}@${env_db.db_name}/test`, { useUnifiedTopology: true, useNewUrlParser: true });
//mongoose.connect(`mongodb+srv://${env_db.db_host}:27017/${env_db.db_name}`, { useUnifiedTopology: true, useNewUrlParser: true });


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${env_db.db_username}:${env_db.db_password}@root.nxvir.mongodb.net/${env_db.db_name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});