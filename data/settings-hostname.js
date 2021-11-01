/* General settings */
process.env.PORT                = "3000";
process.env.NODE_ENV            = "development";
version                         = "2.0.1";
appName                         = "t6";
baseUrl                         = "http://127.0.0.1:3000";
baseUrl_https                   = "http://127.0.0.1:3000";
baseUrlCdn						= "//cdn.domain.tld"; // Your CDN base domain name, if any. You can use Cloudflare for instance.

/* Mqtt settings */
mqttHost			= "localhost"; // Your Mqtt server host
mqttPort			= 1883; // Your Mqtt server port
mqttRoot			= "t6/"+os.hostname()+"/"; // Mqtt root, this is used to have a generic topic
mqttInfo			= mqttRoot+"api"; // Mqtt topic for t6 api

/* Session settings */
secret				= "gktokgortkhoktrhktrzeùfzêfzeflefz"; // Keyboard-cat
sessionDuration		= 3600*24*10; // Cookie session duration, 10 days
store				= new FileStore({ttl: sessionDuration, path: "/path/to/sessions"}); // Force session folder as absolute path in settings
sessionSettings		= { store: store, secret: secret, cookie: { maxAge: (sessionDuration*1000) }, resave: true, saveUninitialized: true };
cookie				= sessionSettings.cookie;
staticOptions		= { etag: true, maxAge: 10*24*3600*1000 }; // 10 Days

/* JWT */
jwtsettings = {
	expiresInSeconds: 5*60, // JWT session duration in seconds, it should be short: 5 minutes
	refreshExpiresInSeconds: 60*60*24, // JWT session duration in seconds for refreshToken, it can be longer: 24 hours
	secret: "ThisIsAVeryGoodSecretForMyAPI", // Keyboard-cat,
	algorithms: ["HS256", "RS256"]
};

/* Http settings */
timeoutDuration		= "10s"; // Serve Http response with a timeout status after this period 

/* Logs settings */
logFormat			= "combined"; // Can be either: common|dev|combined|tiny|short
logLevel			= "LOG|DEBUG|INFO|WARNING|ERROR"; // LOG|DEBUG|INFO|WARNING|ERROR
logAccessFile		= "/path/to/var/log/node/t6-access.log"; // The absolute file on the server for access logs
logErrorFile		= "/path/to/var/log/node/t6-error.log"; // The absolute file on the server for error logs
logDateFormat		= "DD/MMM/YYYY:H:mm:ss ZZ"; // The "moment.js" date format for logging time

/* Email settings */
from				= "t6 <contact@domain.tld>"; // The Sender email address
bcc					= "t6 <contact@domain.tld>"; // To receive New account in your Admin inbox as BCC
mailhost			= "my_smtp.domain.tld"; // Your Smtp server
mailauth			= { user: "my_smtp_username", pass: "my_smtp_password" }; // Your Smtp credentials
mailDKIMCertificate = "/path/to/data/certificates/dkim/privatekey.txt"; // The DKIM cetificate private file
fs.access(mailDKIMCertificate, fs.constants.W_OK, (err) => {
	if (err) {
		transporter = nodemailer.createTransport({
			host : mailhost,
			port: 587,
			ignoreTLS : true,
			auth : mailauth,
			dkim : {
				domainName : "",
				keySelector : ""
			}
		});
	} else {
		transporter = nodemailer.createTransport({
			host : mailhost,
			port: 587,
			ignoreTLS : true,
			auth : mailauth,
			dkim : {
				domainName : "",
				keySelector : "",
				privateKey : fs.readFileSync(mailDKIMCertificate, "utf8")
			}
		});
	}
	t6console.info(`mailDKIMCertificate ${err ? "is not not found. Transporter is not using DKIM" : "found. Transporter is using DKIM certificate."}`);
});

/* Database settings - Storage */
db_type	= {
	influxdb: true, // Does not make any sense to disable this feature... but...
	telegraf: true,
	sqlite3: false, // Do not activate it is deprecated
};
influxSettings		= {
	username : "datawarehouse",
	password : "datawarehouse",
	database : "t6",
	retentionPolicies:{"requests": "quota4w", "data": ["autogen", "retention1d", "retention1w", "retention4w", "retention1y"], "events": "autogen"},
	influxdb: {
		host : "localhost",
		protocol : "http",
		port : 8086,
	},
	telegraf: {
		host : "localhost",
		protocol : "http",
		port : 8186,
	}
};

/* Quota settings */
quota = {
	"admin": {price: "99.99", currency:"€", objects: 999, flows: 999, rules: 999, tokens: 999, snippets: 999, dashboards: 999, categories: 50, uis: 999, calls: 9999999},
	"user": {price: "2.99", currency:"€", objects: 5, flows: 8, rules: 8, tokens: 8, snippets: 3, dashboards: 9, categories: 20, uis: 9, calls: 99},
	"free": {price: "0.00", currency:"€", objects: 1, flows: 1, rules: 1, tokens: 1, snippets: 2, dashboards: 1, categories: 20, uis: 2, calls: 49}
};

/* Localization settings */
localization = {latitude: 39.800327, longitude: 6.343530}; // The physical location of the webserver, this helps to calculate daytime on decisionRules

/* Firebase Admin for Notification */
// https://console.firebase.google.com/u/0/project/t6-app/settings/serviceaccounts/adminsdk
firebase = {
	admin: {
		serviceAccountFile : "/path/to/data/certificates/t6-app-firebase-adminsdk.json"
	}
};

/* pushSubscription */
/* pushSubscription */
//https://console.firebase.google.com/u/0/project/t6-app/settings/cloudmessaging/
pushSubscriptionOptions = {
	gcmAPIKey: "",
	vapidDetails: {
		subject: "mailto:",
		publicKey: "",
		privateKey: ""
	},
	TTL: 3600
};

/* Trackings */
trackings = {
	gtm: "GTM-xxxx",
	googleSigninClientId: "",
	ggads: "ca-pub-xxxx",
	firebaseConfig: {
		firebaseJsVersion: "8.2.7", // https://firebase.google.com/docs/web/setup
		web: {
			apiKey: "xxxx",
			authDomain: "xxxx.firebaseapp.com",
			databaseURL: "https://xxxx.firebaseio.com",
			projectId: "xxxx",
			storageBucket: "xxxx.appspot.com",
			messagingSenderId: "xxxx",
			appId: "1:xxxx:web:xxxx",
			measurementId: "G-xxxx"
		},
		android: {
			apiKey: "xxxx",
			authDomain: "xxxx.firebaseapp.com",
			databaseURL: "https://xxxx.firebaseio.com",
			projectId: "xxxx",
			storageBucket: "xxxx.appspot.com",
			messagingSenderId: "xxxx",
			appId: "1:xxxx:android:xxxx",
			measurementId: "G-xxxx"
		},
		server: {
			api_secret: "",
			measurementId: "G-xxxx",
			appId: "xxxx:web:xxxx"
		}
	}
};

/* IFTTT settings */
// Please note Ifttt is beta only
ifttt = {
	apiUrl: "https://api.internetcollaboratif.info/v2.0.1/ifttt",
	realtimeApi: { url: "https://realtime.ifttt.com/v1/notifications", port: 443 },
	serviceKey: "",
	serviceClientId: "",
	serviceSecret: ""
};

/* OTA settings */
/* This is seriously beta */
ota = {
	"build_dir" : "/path/to/data/t6/tmp", // Folder where the built sketches are stored, must be writable by t6 applciation
	"arduino_binary_cli" : "/path/to/bin/arduino-cli", // Binary file of Arduino-CLI, can be installed via https://arduino.github.io/arduino-cli/installation/ 
	"config" : "/path/to/.arduino15/arduino-cli.yaml", // Arduino-CLI configuration, created using `arduino-cli config init`
	"python3" : "/path/to/tools/python3/3.7.2-post1/python3", // Used in the deploy to OTA
	"espota_py" : "/path/to/tools/espota.py", // Used in the deploy to OTA
	"fqbn" : "esp8266:esp8266:nodemcu:xtal=80,vt=flash,exception=legacy,ssl=all,eesz=4M2M,ip=lm2f,dbg=Disabled,lvl=None____,wipe=none,baud=115200",
	"defaultPort": 8266
};

/* custom units */
customUnits = {
	"db": "/path/to/data/t6custom.units"
};

/* Data Fusion */
dataFusion = {
	"activated": true,
};

/* Twilio settings */
twilioSettings = {
	"accountSid": "", // Your Account SID from www.twilio.com/console
	"authToken": "", // Your Auth Token from www.twilio.com/console
	"from": ""
}
