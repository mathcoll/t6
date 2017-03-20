


int debug = 0;
const char * t6_server = "192.168.0.21";
int port = 3000;
const char* ssid = "";
const char* password = "";
const char* flow_idHCHC = ""; //HCHC
const char* flow_idHCHP = ""; //HCHP
const char* object_id = ""; //Power Meter
const char* Bearer = "";
const char* contentType = "application/json";

unsigned int    POST_INTERVAL = 60000*10;  // 10 min
unsigned long   previousMillisPOST = 0;
