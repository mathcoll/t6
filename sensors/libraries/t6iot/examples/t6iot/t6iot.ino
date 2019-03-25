/*
  t6iot.ino - 
  Created by mathieu@internetcollaboratif.info <Mathieu Lory>.
  Sample file to connect t6 api
  - t6 iot: https://api.internetcollaboratif.info
  - Api doc: https://api.internetcollaboratif.info/docs/
*/

#include <t6iot.h>
#include "settings.h"

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
  Serial.print("WiFi connected. IP address: ");
  Serial.println(WiFi.localIP());
  
  t6Client.begin(httpHost, httpPort, userAgent, timeout);
}


/*
* set Arduino to sleep mode
*/
void pleaseGoToBed() {
  Serial.println();
  Serial.println();
  Serial.println("Sleeping in few milliseconds...");
  delay(500);
  ESP.deepSleep(SLEEP_DELAY_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
  delay(1500);
}

String responseA; // for authentication
String responseD; // for datapoints
String responseDT; // for datatypes
String responseU; // for units
String responseS; // for status
String responseIndex; // for index
  
/*
* Use JWT token from Authenticate
*/
void handleAuthenticateResponse() {
  const int A_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer A_jsonRequestBuffer(A_BUFFER_SIZE);
  JsonObject& authenticate = A_jsonRequestBuffer.parseObject(responseA);
  if (!authenticate.success()) {
    Serial.println("Failure on parsing json.");
    Serial.println(responseA);
  } else {
    const char* Aerror = authenticate["error"];
    const char* Atoken = authenticate["token"];
    const char* Astatus = authenticate["status"];
    const char* Arefresh_token = authenticate["refresh_token"];
    const char* ArefreshTokenExp = authenticate["refreshTokenExp"];
    if ( Aerror ) {
      Serial.println("Failure on:");
      Serial.println(responseA);
    }
    Serial.println();
    Serial.print("\tToken: ");
    Serial.println( Atoken );
    Serial.print("\tStatus: ");
    Serial.println( Astatus );
    Serial.print("\tRefresh Token: ");
    Serial.println( Arefresh_token );
    Serial.print("\tRefresh Token Exp: ");
    Serial.println( ArefreshTokenExp );
    Serial.println();
  }
} // handleAuthenticateResponse
  
/*
* Retrieve and use t6 api Status
*/
void handlStatusResponse() {
  const int S_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer S_jsonRequestBuffer(S_BUFFER_SIZE);
  JsonObject& status = S_jsonRequestBuffer.parseObject(responseS);
  if (!status.success()) {
    Serial.println("Failure on parsing json.");
    Serial.println(responseS);
  } else {
    const char* Serror = status["error"];
    const char* Sstatus = status["status"];
    const char* Sversion = status["version"];
    if ( Serror ) {
      Serial.println("Failure on:");
      Serial.println(responseS);
    }
    Serial.println();
    Serial.print("\tStatus: ");
    Serial.println( Sstatus );
    Serial.print("\tVersion: ");
    Serial.println( Sversion );
    Serial.println();
  }
} // handlStatusResponse

/*
* Retrieve and use t6 Datatypes
*/
void handleDatatypesResponse() {
  const int DT_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer DT_jsonRequestBuffer(DT_BUFFER_SIZE);
  JsonObject& datatypes = DT_jsonRequestBuffer.parseObject(responseDT);
  if (!datatypes.success()) {
    Serial.println("Failure on parsing json.");
    Serial.println(responseDT);
  } else {
    const char* DTerror = datatypes["error"];
    const char* DTstatus = datatypes["status"];
    const char* DTversion = datatypes["version"];
    if ( DTerror ) {
      Serial.println("Failure on:");
      Serial.println(responseDT);
    }
    Serial.println();
    Serial.println();
  }
} // handleDatatypesResponse

/*
* Retrieve and use t6 units
*/
void handleUnitsResponse() {
  Serial.println( "handleUnitsResponse" );
} // handleUnitsResponse
  
/*
* Add data point to timeserie
*/
void handleDatapointResponse() {
  /*
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);
  JsonObject& payload = jsonRequestBuffer.createObject();
  payload["value"] = 123;
  payload["text"] = "";
  payload["publish"] = "true";
  payload["save"] = "false";
  payload["unit"] = "";
  payload["mqtt_topic"] = "";
  payload["latitude"] = "";
  payload["longitude"] = "";
  
  t6Client.createDatapoint(t6FlowId, payload, &responseD);
  const int D_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer D_jsonRequestBuffer(D_BUFFER_SIZE);
  JsonObject& datapoint = D_jsonRequestBuffer.parseObject(responseD);

  if (!datapoint.success()) {
    Serial.println("Failure on parsing json.");
    Serial.println(responseD);
  } else {
    const char* Derror = datapoint["error"];
    const char* Did = datapoint["data"][0]["attributes"]["id"];
    const char* Dtime = datapoint["data"][0]["attributes"]["time"];
    const char* Dtimestamp = datapoint["data"][0]["attributes"]["timestamp"];
    const char* Dvalue = datapoint["data"][0]["attributes"]["value"];
    if ( Derror ) {
      Serial.println("Failure on:");
      Serial.println(responseD);
    }
    Serial.println();
    Serial.print("\tId: ");
    Serial.println( Did );
    Serial.print("\tTime: ");
    Serial.println( Dtime );
    Serial.print("\tTimestamp: ");
    Serial.println( Dtimestamp );
    Serial.print("\tValue: ");
    Serial.println( Dvalue );
    Serial.println();
  }
  */
} // handleDatapointResponse



/*
* Loop
*/
void loop() {
  t6Client.authenticate(t6Username, t6Password, &responseA);
    handleAuthenticateResponse();
  t6Client.getStatus(&responseS);
    handlStatusResponse();
  t6Client.getDatatypes(&responseDT);
    handleDatatypesResponse();
  t6Client.getUnits(&responseU);
    handleUnitsResponse();
  t6Client.getIndex(&responseIndex);
    ;
  
  // 0. Users
  //Serial.println("0. Users");
  //t6Client.createUser();
  //t6Client.getUser();
  //t6Client.editUser();
  
  // 1. Objects
  //Serial.println("1. Objects");
  //t6Client.createObject();
  //t6Client.getObjects();
  //t6Client.editObject();
  //t6Client.deleteObject();
  
  // 2. Flows
  //Serial.println("2. Flows");
  //t6Client.createFlow();
  //t6Client.getFlows();
  //t6Client.editFlow();
  //t6Client.deleteFlow();
  
  // 3. Dashboards
  //Serial.println("3. Dashboards");
  //t6Client.createDashboard();
  //t6Client.getDashboards();
  //t6Client.editDashboard();
  //t6Client.deleteDashboard();
  
  // 4. Snippets
  //Serial.println("4. Snippets");
  //t6Client.createSnippet();
  //t6Client.getSnippets();
  //t6Client.editSnippet();
  //t6Client.deleteSnippet();
  
  // 5. Rules
  //Serial.println("5. Rules");
  //t6Client.createRule();
  //t6Client.getRules();
  //t6Client.editRule();
  //t6Client.deleteRule();
  
  // 6. Mqtts
  //Serial.println("6. Mqtts");
  //t6Client.createMqtt();
  //t6Client.getMqtts();
  //t6Client.editMqtt();
  //t6Client.deleteMqtt();

  pleaseGoToBed();
} // Loop
