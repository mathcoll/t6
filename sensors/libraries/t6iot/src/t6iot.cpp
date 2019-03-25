/*
  t6iot.cpp - 
  Created by mathieu@internetcollaboratif.info <Mathieu Lory>.
  Sample file to connect t6 api
  - t6 iot: https://api.internetcollaboratif.info
  - Api doc: https://api.internetcollaboratif.info/docs/
*/

/*#include <t6iot.h>*/
#include "t6iot.h"

#include <Arduino.h>
#include <ArduinoJWT.h>
#include <sha256.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

const size_t MAX_CONTENT_SIZE = 512;
WiFiClient client;
String _JWTToken;
bool authorized = false;
int processes = 0;
extern char* objectId;
extern char* secret;

int t6iot::begin(char* host, int port) {
  return begin(host, port, "", 3000);
}
int t6iot::begin(char* host, int port, char* ua) {
  return begin(host, port, ua, 3000);
}
int t6iot::begin(char* host, int port, char* ua, int timeout) {
  _timeout = timeout;
  _httpHost = host;
  _httpPort = port;
  _urlJWT = "/v2.0.1/authenticate";
  _urlStatus = "/v2.0.1/status";
  _urlIndex = "/v2.0.1/index";
  _urlDataPoint = "/v2.0.1/data/";
  _urlObjects = "/v2.0.1/objects/";
  _urlFlows = "/v2.0.1/flows/";
  _urlSnippets = "/v2.0.1/snippets/";
  _urlDashboards = "/v2.0.1/dashboards/";
  _urlRules = "/v2.0.1/rules/";
  _urlMqtts = "/v2.0.1/mqtts/";
  _urlUsers = "/v2.0.1/users/";
  _urlDatatypes = "/v2.0.1/datatypes/";
  _urlUnits = "/v2.0.1/units/";
  _userAgent = ua;
  
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
    return 0;
  }
  return 1;
}
void t6iot::authenticate(const char* t6Username, const char* t6Password) {
  return authenticate(t6Username, t6Password, NULL);
}
void t6iot::authenticate(const char* t6Username, const char* t6Password, String* res) {
  Serial.println("Authenticating to t6:");
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
  }
  _t6Username = t6Username;
  _t6Password = t6Password;
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);
  JsonObject& payload = jsonRequestBuffer.createObject();
  payload["username"] = _t6Username;
  payload["password"] = _t6Password;
  
  _postRequest(&client, _urlJWT, payload, false);
  
  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line); // output the response from server
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }
  //read first line of body
  while (client.available()) {
    String line = client.readStringUntil('\n');
    const char* lineChars = line.c_str();
    res->concat(line);
    JsonObject& response = jsonRequestBuffer.parseObject(lineChars);
    _JWTToken = response.get<char*>("token");
  }
}
void t6iot::getStatus(String* res) {
  Serial.println("Getting t6 Api Status:");
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
  }
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);
  
	_getRequest(&client, _urlStatus);
  
  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line); // output the response from server
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }
  //read first line of body
	while (client.available()) {
		String line = client.readStringUntil('\n');
		const char* lineChars = line.c_str();
    res->concat(line);
	}
}
void t6iot::getDatatypes(String* res) {
  Serial.println("Getting datatypes:");
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
  }
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);
  
  _getRequest(&client, _urlDatatypes);
  
  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line); // output the response from server
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }
  //read first line of body
  while (client.available()) {
    String line = client.readStringUntil('\n');
    const char* lineChars = line.c_str();
    res->concat(line);
  }
}
void t6iot::getUnits(String* res) {
  Serial.println("Getting units:");
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
  }
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);

  _getRequest(&client, _urlUnits);

  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line); // output the response from server
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }
  //read first line of body
  while (client.available()) {
    String line = client.readStringUntil('\n');
    const char* lineChars = line.c_str();
    res->concat(line);
  }
}
void t6iot::getIndex(String* res) {
  Serial.println("Getting index:");
  if (!client.connect(_httpHost, _httpPort)) {
	Serial.println("Http connection failed");
  }
  StaticJsonBuffer<400> jsonBuffer;
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);

  _getRequest(&client, _urlIndex);

  while (client.available()) {
	String line = client.readStringUntil('\n');
	//Serial.println(line); // output the response from server
	if (line.length() == 1) { //empty line means end of headers
	  break;
	}
  }
  //read first line of body
  while (client.available()) {
	String line = client.readStringUntil('\n');
	const char* lineChars = line.c_str();
	res->concat(line);
  }
}
void t6iot::createUser() {
	
}
void t6iot::getUser(char* userId) {
	
}
void t6iot::editUser() {
	
}
void t6iot::createDatapoint(char* flowId, JsonObject& payload, String* res) {
  Serial.println("Adding datapoint to t6:");
  if (!client.connect(_httpHost, _httpPort)) {
    Serial.println("Http connection failed");
  }

  _postRequest(&client, _urlDataPoint+String(flowId), payload, true);
  
  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line); // output the response from server
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }
  //read first line of body
  while (client.available()) {
    String line = client.readStringUntil('\n');
    const char* lineChars = line.c_str();
    res->concat(line);
  }
}
void t6iot::getDatapoints() {
	
}
void t6iot::createObject() {
	
}
void t6iot::getObjects() {
	
}
void t6iot::editObject() {
	
}
void t6iot::deleteObject() {
	
}
void t6iot::createFlow() {
	
}
void t6iot::getFlows() {
	
}
void t6iot::editFlow() {
	
}
void t6iot::deleteFlow() {
	
}
void t6iot::createDashboard() {
	
}
void t6iot::getDashboards() {
	
}
void t6iot::editDashboard() {
	
}
void t6iot::deleteDashboard() {
	
}
void t6iot::createSnippet() {
	
}
void t6iot::getSnippets() {
	
}
void t6iot::editSnippet() {
	
}
void t6iot::deleteSnippet() {
	
}
void t6iot::createRule() {
	
}
void t6iot::getRules() {
	
}
void t6iot::editRule() {
	
}
void t6iot::deleteRule() {
	
}
void t6iot::createMqtt() {
	
}
void t6iot::getMqtts() {
	
}
void t6iot::editMqtt() {
	
}
void t6iot::deleteMqtt() {
	
}
void t6iot::_getRequest(WiFiClient* client, String url) {
  Serial.print("GETing from: ");
  Serial.println(url);

	client->print("GET ");
	client->print(url);
	client->println(" HTTP/1.1");
	client->print("Host: ");
	client->println(_httpHost);
  client->print("User-Agent: Arduino/2.2.0/t6iot-library/");
  client->println(_userAgent);
	if (_JWTToken) {
		client->print("Authorization: Bearer ");
		client->println(_JWTToken);
	}
	client->println("Accept: application/json");
	client->println("Content-Type: application/json");
	client->println("Connection: close");
	client->println();
	
	delay(_timeout);
}
void t6iot::_postRequest(WiFiClient* client, String url, JsonObject& payload, bool useSignature) {
	String payloadStr;
	payload.printTo(payloadStr);
  Serial.print("POSTing to: ");
  Serial.println(url);

  client->print("POST ");
  client->print(url);
  client->println(" HTTP/1.1");
  client->print("Host: ");
  client->println(_httpHost);
  client->print("User-Agent: Arduino/2.2.0/t6iot-library/");
  client->println(_userAgent);
  if (_JWTToken) {
    client->print("Authorization: Bearer ");
    client->println(_JWTToken);
  }
  client->println("Accept: application/json");
  client->println("Content-Type: application/json");
  client->print("Content-Length: ");
  
  if (useSignature) {
    Serial.print("as signed payload:");
    payloadStr = _getSignedPayload(payload, objectId, secret);
    client->println(payloadStr.length());
    client->println("Connection: close");
    client->println();
    client->println(payloadStr);
  } else {
    client->println(payloadStr.length());
    client->println("Connection: close");
    client->println();
    payload.printTo(*client);
  }
  client->println();

	delay(_timeout);
}
String t6iot::_getSignedPayload(JsonObject& payload, char* objectId, char* secret) {
  ArduinoJWT jwt = ArduinoJWT(secret);
  String signedJson;
  String payloadString;
  String signedPayloadAsString;
  
  payload.printTo(payloadString);
  signedJson = jwt.encodeJWT( payloadString );
  
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(25);
  StaticJsonBuffer<BUFFER_SIZE> jsonBufferSigned;
  JsonObject& signedPayload = jsonBufferSigned.createObject();
  signedPayload["signedPayload"] = signedJson;
  signedPayload["object_id"] = objectId;
  signedPayload.prettyPrintTo(Serial);
  
  signedPayload.printTo(signedPayloadAsString);
  return signedPayloadAsString;
}
