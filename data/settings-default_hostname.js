/* General settings */
version				= '2.0.1';
appName				= process.env.NAME;
baseUrl				= process.env.BASE_URL;

/* Mqtt settings */
client				= mqtt.connect('mqtt://localhost:1883'); // Your Mqtt server to connect to
mqtt_info			= 'easyIOT/'+os.hostname()+'/api'; // Mqtt topic for Easy-IOT api basic logs

/* Session settings */
session				= require('express-session');
FileStore			= require('session-file-store')(session);
secret				= "gktokgortkhoktrhktrzeùfzêfzeflefz"; // Keyboard-cat
sessionDuration		= 3600*24*10; // 10 days cookie session
store				= new FileStore({ttl: sessionDuration});
sessionSettings		= { store: store, secret: secret, cookie: { maxAge: (sessionDuration*1000) }, resave: true, saveUninitialized: true };
cookie				= sessionSettings.cookie;

/* Email settings */
nodemailer			= require('nodemailer');
from				= "Easy-IOT <contact@domain.tld>"; // The Sender email address
bcc					= "Easy-IOT <contact@domain.tld>"; // To receive New account in your Admin inbox as BCC
mailhost			= "my_smtp.domain.tld"; // Your Smtp server
mailauth			= { user: "my_smtp_username", pass: "my_smtp_password" }; // Your Smtp credentials
transporter			= nodemailer.createTransport({ host: mailhost, ignoreTLS: true, auth: mailauth });

/* Database settings - Storage */
db_type				= 'sqlite3'; // sqlite3 | influxdb
SQLite3Settings = path.join(__dirname, 'data.db');
influxSettings = { host : 'localhost', port : 8086, protocol : 'http', username : 'datawarehouse', password : 'datawarehouse', database : 'datawarehouse' }

/* Database settings -  */
db	= new loki(path.join(__dirname, 'db-'+os.hostname()+'.json'), {autoload: true, autosave: true});
db.loadDatabase(path.join(__dirname, 'db-'+os.hostname()+'.json'));

dbRules	= new loki(path.join(__dirname, 'rules-'+os.hostname()+'.json'), {autoload: true, autosave: true});
dbRules.loadDatabase(path.join(__dirname, 'rules-'+os.hostname()+'.json'));

/* Quota settings */
quota = {
	'admin': {objects: 99, flows: 99, rules: 99, tokens: 99, calls: 99},
	'user': {objects: 5, flows: 8, rules: 8, tokens: 8, calls: 999}
};
dbQuota	= new loki(path.join(__dirname, 'quota-'+os.hostname()+'.json'), {autoload: true, autosave: true});
dbQuota.loadDatabase(path.join(__dirname, 'quota-'+os.hostname()+'.json'));