const DB_DETAILS = {
	"local": {
		"db_host": "localhost",
		"db_name": "rootapp",
		"db_username": "root_db_user",
		"db_passoword": "wHTEc4WubhZSP9k5",
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


//const mongoURI = "mongodb+srv://MyUserName :<MyPassword>@cluster0.lbb8n.mongodb.net/<DbImUsing>?retryWrites=true&w=majority";


//mongoose.connect(`mongodb+srv://${env_db.db_username}:${env_db.db_password}@rootapp.nxvir.mongodb.net/${env_db.db_name}?retryWrites=true&w=majority`, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connect(`mongodb+srv://root_db_user:wHTEc4WubhZSP9k5@rootapp.nxvir.mongodb.net/rootapp?retryWrites=true&w=majority`, { useUnifiedTopology: true, useNewUrlParser: true });
//mongoose.connect(`mongodb+srv://${env_db.db_host}:27017/${env_db.db_name}`, { useUnifiedTopology: true, useNewUrlParser: true });



// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://root_db_user:wHTEc4WubhZSP9k5@rootapp.nxvir.mongodb.net/rootapp?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   if(err){
// 	  console.log("Connection error=====>",err);
//   }
//   // perform actions on the collection object
//   client.close();
// });
