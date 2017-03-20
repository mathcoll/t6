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
SoftwareSerial teleinfo(15, 13); // Teleinfo Serial D8 D7
TInfo tinfo; // Teleinfo object

void httpRequest(String postData, String flow_id) {
  client.stop();
  Serial.println("Sending data to flow_id: "+flow_id);
  if (client.connect(t6_server, port)) {
    Serial.println("connecting...");
    client.println("POST /v2.0.1/data/ HTTP/1.1");
    client.println("Authorization: Bearer " + String(Bearer));
    client.println("Host: "+String(t6_server));
    //client.println("User-Agent: Arduino/2.2.0/" + String(flow_id+postData));
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

/* ======================================================================
  Function: DataCallback
  Purpose : callback when we detected new or modified data received
  ====================================================================== */
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
    }
    if (debug) {
      Serial.println(".");
      Serial.print("....Cumul IINST   =");
      Serial.print(IINST);
      Serial.println("");
    }
    if (debug) {
      Serial.println(".");
      Serial.print("....IINSTmesure   =");
      Serial.print(IINSTmesure);
      Serial.println("");
    }
  }
}

/* ======================================================================
  Function: setup
  Purpose : Setup I/O and other one time startup stuff
  ====================================================================== */
void setup() {
  Serial.begin(115200);
  // We start by connecting to a WiFi network
  if (debug) {
    Serial.print("Connecting to ");
    Serial.println(ssid);
  }
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("ssid:" + String(ssid));
    delay(500);
    Serial.print(".");
  }
  if (debug) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.println(F("========================================"));
    Serial.println(F(__FILE__));
    Serial.println(F(__DATE__ " " __TIME__));
    Serial.println();
    Serial.println(F("Teleinfo started"));
  }

  // Configure Teleinfo Soft serial
  delay(1000);
  teleinfo.begin(1200); // Init teleinfo
  tinfo.init();
  tinfo.attachData(DataCallback);
}

/* ======================================================================
  Function: loop
  Purpose : infinite loop main code
  ====================================================================== */
void loop() {
  char c;
  if ( teleinfo.available() )  {
    c = teleinfo.read();
    tinfo.process(c);
  }
  unsigned long currentMillisPOST = millis();
  if ((currentMillisPOST - previousMillisPOST) >= (POST_INTERVAL) ) {
    previousMillisPOST = currentMillisPOST;
    if (IINSTmesure > 0) {
      IINSTmoyenne = int(IINST / IINSTmesure) * 230;
    } else {
      IINSTmoyenne = 0;
    }
    //httpPing(String(currentMillisPOST)+"/HC_"+HCHC+"/HP_"+HCHP);

    if (String(HCHC) != "") {
      String postDataHCHC = String("{ \"flow_id\":\"" + String(flow_idHCHC) + "\", \"value\":\"" + String(HCHC) + "\", \"timestamp\": \"\", \"publish\": \"true\", \"save\": \"true\" }");
      Serial.println("post HCHC");
      Serial.println(postDataHCHC);
      httpRequest(postDataHCHC, String(flow_idHCHC));
    }
    if (String(HCHP) != "") {
      String postDataHCHP = String("{ \"flow_id\":\"" + String(flow_idHCHP) + "\", \"value\":\"" + String(HCHP) + "\", \"timestamp\": \"\", \"publish\": \"true\", \"save\": \"true\" }");
      Serial.println("post HCHP");
      Serial.println(postDataHCHP);
      httpRequest(postDataHCHP, String(flow_idHCHP));
    }

    if (debug) {
      Serial.print("IINSTmesure:");
      Serial.println(IINSTmesure);
      Serial.print("IINSTmoyenne:");
      Serial.println(IINSTmoyenne);
    }
    
    IINSTmesure = 0;
    IINST = 0;
  }
}
