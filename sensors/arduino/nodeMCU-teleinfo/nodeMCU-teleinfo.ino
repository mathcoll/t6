#include <SoftwareSerial.h>
#include <LibTeleinfo.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include "settings.h"

String sensorHPValue = "";
String sensorHCValue = "";
String PTEC = "";
unsigned int IINST = 0;
unsigned int IINSTmesure = 0;
unsigned int IINSTmoyenne = 0;
unsigned int starttime = 0;
unsigned int endtime = 0;
unsigned int loopcount = 0;
SoftwareSerial teleinfo(15, 13); // Teleinfo Serial D8 D7
TInfo tinfo; // Teleinfo object

const size_t MAX_CONTENT_SIZE = 512; 
String privateKey;
bool authorized = false;
int processes = 0;

struct sAverage {
  int32_t blockSum;
  uint16_t numSamples;
};

struct sAverage sampleAve;

/*******************************************************
 postRequest
 *******************************************************/
void postRequest(WiFiClient* client, String url, JsonObject& jsonRoot, bool needKey) {
  client->print("POST ");
  client->print(url);
  client->println(" HTTP/1.1");
  client->print("Host: ");
  client->println(host);
  client->println("User-Agent: Arduino/2.2.0/" + String(object_id));
  if (needKey) {
    client->print("Authorization: Bearer ");
    client->println(privateKey);
  }
  client->println("Accept: application/json");
  client->println("Content-Type: application/json");
  client->print("Content-Length: ");

  String dataStr;
  jsonRoot.printTo(dataStr);

  client->println(dataStr.length());
  client->println("Connection: close");
  client->println();
  //client->println(dataStr);
  jsonRoot.printTo(*client);
  client->println();
  delay(5000);
}

/*******************************************************
 getJWToken
 *******************************************************/
void getJWToken() {
  StaticJsonBuffer<400> jsonBuffer; //used to store server response

  //build json object to send data
  // Compute optimal size of the JSON buffer according to what we need to parse.
  // See https://bblanchon.github.io/ArduinoJson/assistant/
  const int BUFFER_SIZE = JSON_OBJECT_SIZE(2); // the root object has 2 elements
  //StaticJsonBuffer<BUFFER_SIZE> jsonRequestBuffer;
  DynamicJsonBuffer jsonRequestBuffer(BUFFER_SIZE);

  JsonObject& loginRoot = jsonRequestBuffer.createObject();
  loginRoot["username"] = loginEmail;
  loginRoot["password"] = loginPass;

  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }

  Serial.println("----------Retrieving JWT--------");
  Serial.println("Retrieving JWT");
  Serial.print("Requesting URL: ");
  Serial.println(urlJWT);

  // This will send the request to the server
  postRequest(&client, urlJWT, loginRoot, false);

  //block until data available
  while (client.available() == 0) {
    if (client.connected() == 0) {
      return;
    }
  }
  Serial.print("response length:");
  Serial.println(client.available());

  client.setTimeout(5000); //in case things get stuck

  //read http header lines
  while (client.available()) {
    String line = client.readStringUntil('\n');
    Serial.println(line);
    if (line.length() == 1) { //empty line means end of headers
      break;
    }
  }

  //read first line of body
  if (client.available()) {
    String line = client.readStringUntil('\n');
    const char* lineChars = line.c_str();
    JsonObject& root = jsonRequestBuffer.parseObject(lineChars);
    const char* jwtToken = root["token"];
    const char* status = root["status"];

    if (!root.success()) {
      Serial.println("-------Parse Json Failed-------");
      Serial.println(lineChars);
      return;
    }

    JsonObject& jwt = root;
    const char* tokArray = jwt["token"];
    String token(tokArray); //convert to String
    privateKey = token;
    //Serial.println("THIS IS MY BEARER:");
    //Serial.println(lineChars);
    //Serial.println(token);
    //Serial.println(privateKey);
    //Serial.println("END BEARER:");
    Serial.println("----------JWT Updated----------");
   
    authorized = true; //login process complete
  }
}

/*******************************************************
 addSampleToAverage
 *******************************************************/
int16_t addSampleToAverage(struct sAverage *ave, int16_t newSample) {
  ave->blockSum += newSample;
  ave->numSamples++;
}

/*******************************************************
 readSample
 *******************************************************/
void readSample() {
  Serial.println("\tMeasuring..."); 
  char c;
  if ( teleinfo.available() )  {
    c = teleinfo.read();
    tinfo.process(c);
  }
  if (IINSTmesure > 0) { IINSTmoyenne = int(IINST / IINSTmesure) * 230; }
  else { IINSTmoyenne = 0; }
  IINSTmesure = 0;
  IINST = 0;

  Serial.print("\tMeasure HC: "); 
  Serial.println(sensorHCValue);
  Serial.print("\tMeasure HP: "); 
  Serial.println(sensorHPValue);
  Serial.println("------------------------------");
  Serial.println();
  delay(3000);
}

/*******************************************************
  getAverage
 *******************************************************/
int16_t getAverage(struct sAverage *ave) {
  int16_t average = ave->blockSum / ave->numSamples;
  // get ready for the next block
  ave->blockSum = 0; ave->numSamples = 0;
  return average;
}

/*******************************************************
 DataCallback
 *******************************************************/
void DataCallback(ValueList * me, uint8_t  flags) {
  if (String(me->name) == String("HCHC") ) {
    sensorHCValue = String(me->value);
    if (debug) {
      Serial.println(".");
      Serial.print("....OK sensorHCValue  =");
      Serial.print(sensorHCValue);
      Serial.println("");
    }
  }
  if (String(me->name) == String("HCHP") ) {
    sensorHPValue = String(me->value);
    if (debug) {
      Serial.println(".");
      Serial.print("....OK sensorHPValue  =");
      Serial.print(sensorHPValue);
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

/*******************************************************
 setup
 *******************************************************/
void setup() {
  Serial.begin(115200);
  delay(10);

  Serial.println();
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

  getJWToken(); //get authorization key

  teleinfo.begin(1200); // Init teleinfo
  tinfo.init();
  tinfo.attachData(DataCallback);
  starttime = millis();
  delay(10);
  readSample();
}

/*******************************************************
 pleaseGoToBed
 *******************************************************/
void pleaseGoToBed() {
    Serial.println();
    Serial.println();
    Serial.println("Sleeping in few seconds...");
    delay(2000);
    Serial.println("Sleeping now.");
    ESP.deepSleep(SLEEP_DELAY_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
}

/*******************************************************
 loop
 *******************************************************/
void loop() {
  endtime = millis();
  
  if ((endtime - starttime) < AWAKE_DURATION) {
    readSample();
  } else {
    if(WiFi.status()== WL_CONNECTED) {
      if ( !privateKey || authorized == false ) {
        //getJWToken();
      }
      
      const int BUFFER_SIZE = JSON_OBJECT_SIZE(6);
      StaticJsonBuffer<BUFFER_SIZE> jsonBufferHC;
      StaticJsonBuffer<BUFFER_SIZE> jsonBufferHP;
     
      // ------------------------------------------------------------ MEASURE HC
      if ( sensorHCValue.toInt()>0 && authorized == true ) {
        Serial.println("----------Sending data for Measure HC----------");
        WiFiClient clientHC;
        if (!clientHC.connect(host, httpPort)) {
          Serial.println("connection failed");
          return;
        }
        JsonObject& dataRootHC = jsonBufferHC.createObject();
        dataRootHC["value"] = sensorHCValue;
        dataRootHC["flow_id"] = HC_flow_id;
        dataRootHC["mqtt_topic"] = HC_mqtt_topic;
        dataRootHC["unit"] = HC_unit;
        dataRootHC["save"] = HC_save;
        dataRootHC["publish"] = HC_publish;
        Serial.println(urlDataPoint);
        dataRootHC.prettyPrintTo(Serial);
        Serial.println();
        //Serial.print("\tUsing Bearer ");
        //Serial.println(privateKey);
        postRequest(&clientHC, urlDataPoint, dataRootHC, true);
        
        if (authorized == false) {
          //getJWToken();
        } else {
          Serial.println("-------------------------");
        }
      }
      // ------------------------------------------------------------ END MEASURE HC
      
      // ------------------------------------------------------------ MEASURE HP
      if ( sensorHPValue.toInt()>0 && authorized == true ) {
        Serial.println("----------Sending data for Measure HP----------");
        WiFiClient clientHP;
        if (!clientHP.connect(host, httpPort)) {
          Serial.println("connection failed");
          return;
        }
        JsonObject& dataRootHP = jsonBufferHP.createObject();
        dataRootHP["value"] = sensorHPValue;
        dataRootHP["flow_id"] = HP_flow_id;
        dataRootHP["mqtt_topic"] = HP_mqtt_topic;
        dataRootHP["unit"] = HP_unit;
        dataRootHP["save"] = HP_save;
        dataRootHP["publish"] = HP_publish;
        Serial.println(urlDataPoint);
        dataRootHP.prettyPrintTo(Serial);
        Serial.println();
        //Serial.print("\tUsing Bearer ");
        //Serial.println(privateKey);
        postRequest(&clientHP, urlDataPoint, dataRootHP, true);
        
        if (authorized == false) {
          //getJWToken();
        } else {
          Serial.println("-------------------------");
        }
      }
      // ------------------------------------------------------------ END MEASURE HP
    }
    pleaseGoToBed();
  }

  delay(1000);
}
