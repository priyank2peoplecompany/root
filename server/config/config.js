const DB_DETAILS = {
	"local": {
		"db_host": "localhost",
		"db_name": "root",
		"db_username": "",
		"db_passoword": "",
		"db_dialect": "",
		"multipleStatements": true
	},
	"development": {
		"db_host": "localhost",
		"db_name": "root",
		"db_username": "",
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

mongoose.connect(`mongodb://${env_db.db_host}:27017/${env_db.db_name}`, { useUnifiedTopology: true, useNewUrlParser: true });