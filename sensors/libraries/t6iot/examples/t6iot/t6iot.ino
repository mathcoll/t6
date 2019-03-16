/*#include <t6iot.h>*/
#include "t6iot.h"

// Wifi
const char* ssid = ""; // Your Wifi SSID
const char* password = ""; // Your Wifi password

// Object
const char* object_id = ""; // The current object ID
const char* secret = ""; // The current object secret for signature
#define SLEEP_DELAY_IN_SECONDS  1800 // Delay before going to sleep mode. 1800 = 30 minutes

// JWT Authentication
const char* t6Username = ""; // Your t6 username
const char* t6Password = ""; // Your t6 password

// t6 server
char* httpHost = "api.internetcollaboratif.info";
int httpPort = 3000;
int timeout = 1000;
char* userAgent = "name of my application";

t6iot t6Client;

void setup() {
  Serial.begin(115200);
  
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected / IP address: ");
  Serial.println(WiFi.localIP());
  
  t6Client.begin(httpHost, httpPort, userAgent, timeout);
}

String responseA;
String responseS;
void loop() {
  /*
  * Authenticate and get the JWT token
  */
  t6Client.authenticate(t6Username, t6Password, &responseA);
  const int A_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer A_jsonRequestBuffer(A_BUFFER_SIZE);
  JsonObject& authenticate = A_jsonRequestBuffer.parseObject(responseA);

  if (!authenticate.success()) {
    Serial.println("Failure on parsing json.");
  } else {
    const char* Atoken = authenticate["token"];
    const char* Astatus = authenticate["status"];
    const char* Arefresh_token = authenticate["refresh_token"];
    const char* ArefreshTokenExp = authenticate["refreshTokenExp"];
    
    Serial.println();
    Serial.print("\tToken: ");
    Serial.println( Atoken );
    Serial.print("\tStatus: ");
    Serial.println( Astatus );
    Serial.print("\tRefresh Token: ");
    Serial.println( Arefresh_token );
    Serial.print("\tRefresh Token Exp: ");
    Serial.println( ArefreshTokenExp );
  } // END authenticate

  /*
  * get t6 Status
  */
  t6Client.getStatus(&responseS);
  const int S_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer S_jsonRequestBuffer(S_BUFFER_SIZE);
  JsonObject& status = S_jsonRequestBuffer.parseObject(responseS);

  if (!status.success()) {
    Serial.println("Failure on parsing json.");
  } else {
    const char* Sstatus = status["status"];
    const char* Sversion = status["version"];
    
    Serial.println();
    Serial.print("\tStatus: ");
    Serial.println( Sstatus );
    Serial.print("\tVersion: ");
    Serial.println( Sversion );
  }
  // END getStatus
  
  //t6Client.getDatatypes();
  //t6Client.getUnits();
  //t6Client.getIndex();
  
  /*
  // 0. Users
  Serial.println("0. Users");
  t6Client.createUser();
  t6Client.getUser();
  t6Client.editUser();
  
  // 0. Datapoints
  Serial.println("0. Datapoints");
  t6Client.createDatapoint();
  t6Client.getDatapoints();
  
  // 1. Objects
  Serial.println("1. Objects");
  t6Client.createObject();
  t6Client.getObjects();
  t6Client.editObject();
  t6Client.deleteObject();
  
  // 2. Flows
  Serial.println("2. Flows");
  t6Client.createFlow();
  t6Client.getFlows();
  t6Client.editFlow();
  t6Client.deleteFlow();
  
  // 3. Dashboards
  Serial.println("3. Dashboards");
  t6Client.createDashboard();
  t6Client.getDashboards();
  t6Client.editDashboard();
  t6Client.deleteDashboard();
  
  // 4. Snippets
  Serial.println("4. Snippets");
  t6Client.createSnippet();
  t6Client.getSnippets();
  t6Client.editSnippet();
  t6Client.deleteSnippet();
  
  // 5. Rules
  Serial.println("5. Rules");
  t6Client.createRule();
  t6Client.getRules();
  t6Client.editRule();
  t6Client.deleteRule();
  
  // 6. Mqtts
  Serial.println("6. Mqtts");
  t6Client.createMqtt();
  t6Client.getMqtts();
  t6Client.editMqtt();
  t6Client.deleteMqtt();
  */
  delay(200000000);
}
