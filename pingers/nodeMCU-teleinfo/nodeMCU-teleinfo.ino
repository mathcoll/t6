#include <SoftwareSerial.h>
#include <LibTeleinfo.h>
#include <ESP8266WiFi.h>
#include "settings.h"

WiFiClient client;
String HCHC = "";
String HCHP = "";
String PTEC = "";
unsigned int IINST = 0;
unsigned int IINSTmesure = 0;
unsigned int IINSTmoyenne = 0;
unsigned int starttime = 0;
unsigned int endtime = 0;
unsigned int loopcount = 0;
SoftwareSerial teleinfo(15, 13); // Teleinfo Serial D8 D7
TInfo tinfo; // Teleinfo object

void httpRequest(String postData, String flow_id) {
  client.stop();
  if (debug) {
    Serial.println("Sending data to flow_id: "+flow_id);
    Serial.println(postData);
  }
  if (client.connect(t6_server, port)) {
    Serial.println("Connecting to "+String(t6_server) + ": Success.");
    client.println("POST /v2.0.1/data/ HTTP/1.1");
    client.println("Authorization: Bearer " + String(Bearer));
    client.println("Host: "+String(t6_server));
    client.println("User-Agent: Arduino/2.2.0/" + String(object_id));
    client.println("Connection: close");
    client.println("Accept: application/json");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(postData.length());
    client.println();
    client.println(postData);
  } else {
    Serial.println("Connecting to "+String(t6_server) + ": Failed.");
  }
}

void httpPing(String postData) {
  client.stop();
  if (client.connect(t6_server, port)) {
    Serial.println("connecting...");
    client.println("POST /v2.0.1/ping/"+postData+" HTTP/1.1");
    client.println("Host: "+String(t6_server));
    client.println("User-Agent: Arduino/2.2.0/" + String(object_id));
    client.println("Connection: close");
    client.println("Accept: application/json");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(postData.length());
    client.println();
    client.println(postData);
  } else {
    Serial.println("connection failed");
  }
}

void DataCallback(ValueList * me, uint8_t  flags) {
  if (String(me->name) == String("HCHC") ) {
    HCHC = String(me->value);
    if (debug) {
      Serial.println(".");
      Serial.print("....OK HCHC  =");
      Serial.print(HCHC);
      Serial.println("");
    }
  }
  if (String(me->name) == String("HCHP") ) {
    HCHP = String(me->value);
    if (debug) {
      Serial.println(".");
      Serial.print("....OK HCHP  =");
      Serial.print(HCHP);
      Serial.println("");
    }
  }
  if (String(me->name) == String("PTEC") ) {
    PTEC = String(me->value);
    if (debug) {
      Serial.println(".");
      Serial.print("....OK PTEC  =");
      Serial.print(PTEC);
      Serial.println("");
    }
  }
  if (String(me->name) == String("IINST") ) {
    IINST = IINST + atoi(me->value);
    IINSTmesure = IINSTmesure + 1;
    if (debug) {
      Serial.println(".");
      Serial.print("....OK IINST   =");
      Serial.print(me->value);
      Serial.println("");
      Serial.println(".");
      Serial.print("....Cumul IINST   =");
      Serial.print(IINST);
      Serial.println("");
      Serial.println(".");
      Serial.print("....IINSTmesure   =");
      Serial.print(IINSTmesure);
      Serial.println("");
    }
  }
}

void setup() {
  Serial.begin(115200);
  teleinfo.begin(1200); // Init teleinfo
  tinfo.init();
  tinfo.attachData(DataCallback);
  starttime = millis();
  
  if (debug) {
    Serial.println("");
    Serial.println(F("========================================"));
    Serial.println(F(__FILE__));
    Serial.println(F(__DATE__ " " __TIME__));
    Serial.println();
    Serial.println(F("Teleinfo started"));
  }
}

void loop() {
  endtime = millis();
  if ((endtime - starttime) < AWAKE_DURATION) {
    char c;
    if ( teleinfo.available() )  {
      c = teleinfo.read();
      tinfo.process(c);
    }
    
    if (IINSTmesure > 0) {
      IINSTmoyenne = int(IINST / IINSTmesure) * 230;
    } else {
      IINSTmoyenne = 0;
    }
    
    IINSTmesure = 0;
    IINST = 0;
  } else {
    if (debug) {
      Serial.print("Connecting to ");
      Serial.println(ssid);
    }  
    while (WiFi.status() != WL_CONNECTED && millis()<timeout) {
      WiFi.begin(ssid, password);
      delay(500); 
      Serial.print(".");
    }
    if (debug) {
      Serial.println("");
      Serial.println("WiFi connected using IP address: ");
      Serial.println(WiFi.localIP());
      Serial.println(WiFi.status());
    }

    if(WiFi.status() == WL_CONNECTED) {
      Serial.println("WL_CONNECTED OK");
      if (String(HCHC) != "") {
        String postDataHCHC = String("{ \"flow_id\":\"" + String(flow_idHCHC) + "\", \"value\":\"" + String(HCHC) + "\", \"timestamp\": \"\", \"publish\": \"true\", \"save\": \"true\" }");
        Serial.println("post HCHC");
        httpRequest(postDataHCHC, String(flow_idHCHC));
      }
      if (String(HCHP) != "") {
        String postDataHCHP = String("{ \"flow_id\":\"" + String(flow_idHCHP) + "\", \"value\":\"" + String(HCHP) + "\", \"timestamp\": \"\", \"publish\": \"true\", \"save\": \"true\" }");
        Serial.println("post HCHP");
        httpRequest(postDataHCHP, String(flow_idHCHP));
      }
    } else {
      Serial.println("WL_CONNECTED NOT OK");
    }
    Serial.print("Waiting for the reply, ");
    Serial.print(timeout);
    Serial.println(" M.Secondes.");
    delay(timeout);
    
    Serial.print("Entering deep sleep mode...");
    ESP.deepSleep(SLEEP_DURATION, WAKE_RF_DEFAULT);
  }
}
