// Wifi
const char* ssid = ""; // Your Wifi SSID
const char* password = ""; // Your Wifi password

// t6 server
const char* host = "api.internetcollaboratif.info";
const int httpPort = 80;
const char* urlJWT = "/v2.0.1/authenticate";
const char* urlDataPoint = "/v2.0.1/data";

// Object
const char* object_id = ""; // The current object ID
const char* secret = ""; // The current object secret for signature
#define SLEEP_DELAY_IN_SECONDS  1800 // Delay before going to sleep mode. 1800 = 30 minutes

// JWT Authentication
const char* loginEmail = ""; // Your t6 username
const char* loginPass = ""; // Your t6 password

// Flow for Temperature
const char* T_flow_id = ""; // DHT Temperature Flow ID in t6
const char* T_mqtt_topic = ""; // Mqtt topic (optional)
const char* T_unit = "°C"; // Maesure Unit (optional)
const char* T_save = "true"; // (optional)
const char* T_publish = "true"; // (optional)

// Flow for Humidity
const char* H_flow_id = ""; // DHT Humidity Flow ID in t6
const char* H_mqtt_topic = ""; // Mqtt topic (optional)
const char* H_unit = "%"; // Maesure Unit (optional)
const char* H_save = "true"; // (optional)
const char* H_publish = "true"; // (optional)

// DHT
#define DHTPIN D1         // Pin for DHT sensor
#define DHTTYPE DHT11     // DHT 11 
//#define DHTTYPE DHT21   // DHT 21 (AM2301)
//#define DHTTYPE DHT22   // DHT 22 (AM2302)
