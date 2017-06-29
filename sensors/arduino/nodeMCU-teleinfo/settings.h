


int debug = 1;
const char * t6_server = "192.168.0.1";
int port = 3000;
const char* ssid = "";
const char* password = "";
const char* flow_idHCHC = ""; //HCHC
const char* flow_idHCHP = ""; //HCHP
const char* object_id = ""; //Power Meter
const char* Bearer = "";
const char* contentType = "application/json";

unsigned int    SLEEP_DURATION = 60000000 * 45;    // 45 min deep-sleeping
unsigned int    AWAKE_DURATION = 60000 * 1;  // 1 min awake to collect data
unsigned int    timeout = 60000 * 1;  // 1 min additional awake to wait for the answer
