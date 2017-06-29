
// t6 server
const char* host = "192.168.0.15"; // t6 server IP Address
const int httpPort = 3000;
const char* urlJWT = "/v2.0.1/authenticate";
const char* urlDataPoint = "/v2.0.1/data";
const char* object_id = "";
#define SLEEP_DELAY_IN_SECONDS  1800    // 30 minutes

// JWT Authentication
const char* loginEmail = "";
const char* loginPass = "";

// Flow for Temperature
const char* T_flow_id = "";
const char* T_mqtt_topic = "";
const char* T_unit = "°C";
const char* T_save = "true";
const char* T_publish = "true";

// Flow for Humidity
const char* H_flow_id = "";
const char* H_mqtt_topic = "";
const char* H_unit = "%";
const char* H_save = "true";
const char* H_publish = "true";

// Wifi
const char* ssid = "";
const char* password = "";

// DHT
#define DHTPIN D1
#define DHTTYPE DHT11     // DHT 11 
//#define DHTTYPE DHT22      // DHT 22  (AM2302)
//#define DHTTYPE DHT21     // DHT 21 (AM2301)

