/*
  pcf8563.ino - 
  Created by mathieu@internetcollaboratif.info <Mathieu Lory>.
  Sample file to connect t6 api only during daylight
  
  - t6 iot: https://api.internetcollaboratif.info
  - Api doc: https://api.internetcollaboratif.info/docs/

   SCK - A5, SDA - A4, INT - D3/INT1
 */ 
#include <t6iot.h>
#include <Wire.h>
#include <Rtc_Pcf8563.h>
#include <ESP8266WiFi.h>
#include "settings.h"

Rtc_Pcf8563 rtc;

String responseA; // for authentication
String responseD; // for datapoints
t6iot t6Client;

struct sAverage {
  int32_t blockSum;
  uint16_t numSamples;
};

struct sAverage sampleAve;
int16_t sensorTValue = 0;


/*******************************************************
 addSampleToAverage
 *******************************************************/
int16_t addSampleToAverage(struct sAverage *ave, int16_t newSample) {
  ave->blockSum += newSample;
  ave->numSamples++;
}

/*******************************************************
  getAverage
 *******************************************************/
int16_t getAverage(struct sAverage *ave) {
  int16_t average = ave->blockSum / ave->numSamples;
  // get ready for the next block
  ave->blockSum = 0;
  ave->numSamples = 0;
  return average;
}

/*******************************************************
 readSample
 *******************************************************/
void readSample() {
  digitalWrite(soilPower, HIGH); //turn "On"
  int count=0;
  do {
    int moisture = analogRead(VAL_PROBE);
    
    Serial.print(moisture);
    Serial.print(" -> ");
    moisture = constrain(moisture, 0, 1024);
    Serial.print(moisture);
    Serial.print(" (");
    Serial.print(count);
    Serial.println(")");
    
    count++;
    addSampleToAverage(&sampleAve, moisture);
    
    delay(100);
  } while (count <= 10);
  digitalWrite(soilPower, LOW); //turn "Off"
  Serial.println("------------------------------");
}

/*******************************************************
 wifi
 *******************************************************/
void wifi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  delay(2000);
}

/*******************************************************
 pleaseGoToBed
 *******************************************************/
void pleaseGoToBed() {
    Serial.println();
    Serial.println();
    Serial.println("Sleeping in few seconds...");
    delay(500);
    ESP.deepSleep(SLEEP_DURATION_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
}
  
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
* Add data point to timeserie
*/
void handleDatapointResponse() {
  const int D_BUFFER_SIZE = JSON_OBJECT_SIZE(2);
  DynamicJsonBuffer D_jsonRequestBuffer(D_BUFFER_SIZE);
  JsonObject& datapoint = D_jsonRequestBuffer.parseObject(responseD);
  if (!datapoint.success()) {
    Serial.println("Failure on parsing json.");
    Serial.println(responseD);
  } else {
    const char* Derror = datapoint["error"];
    if ( Derror ) {
      Serial.println("Failure on:");
      Serial.println(responseD);
    }
    Serial.println();
    Serial.println();
  }
} // handleDatapointResponse

void setup() {
  //rtc.initClock();
  //rtc.setDate(12, 6, 6, 0, 19); //day, weekday, month, century(1=1900, 0=2000), year(0-99)
  //rtc.setTime(21, 8, 50); //hr, min, sec
  
  Serial.println("Set to LOW so no power is flowing through the sensor");
  pinMode(soilPower, OUTPUT);
  //digitalWrite(soilPower, LOW);
  
  Serial.println("Activating console");
  Serial.begin(9600);
}

void loop() {
  Serial.print("\r\n");
  Serial.println(rtc.formatDate(RTCC_DATE_WORLD));
  Serial.println(rtc.formatTime());
  Serial.print("\r\n");
  if ( rtc.getHour() >= 8 && rtc.getHour() < 22 ) {
    Serial.print("Day: ");
    Serial.println(rtc.getHour());
    //measure;
    Serial.println("readSample");
    readSample();
    
    //connect wifi;
    Serial.println("Connect wifi");
    wifi();
    t6Client.begin(httpHost, httpPort, userAgent, timeout);
    //t6Client.authenticateKS(t6Key, t6Secret, &responseA);
    t6Client.authenticate(t6Username, t6Password, &responseA);
      handleAuthenticateResponse();
    
    //post data;
    const int BUFFER_SIZE = JSON_OBJECT_SIZE(7);
    StaticJsonBuffer<BUFFER_SIZE> jsonBuffer;
    JsonObject& payload = jsonBuffer.createObject();
    payload["value"] = getAverage(&sampleAve);
    payload["flow_id"] = t6FlowId;
    payload["save"] = "true";
    payload["publish"] = "true";
    payload["object_id"] = objectId;
    payload.prettyPrintTo(Serial);
    
    t6Client.createDatapoint(t6FlowId, payload, false, &responseD);
      handleDatapointResponse();
    
    //sleep
  } else {
    Serial.print("Night: ");
    Serial.println(rtc.getHour());
  }
  Serial.print("\r\n");
  delay(5000);
  pleaseGoToBed();
}
