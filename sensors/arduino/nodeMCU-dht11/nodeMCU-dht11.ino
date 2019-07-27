#include <ArduinoJWT.h>
#include <sha256.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h> /* ArduinoJson 5.13.14 tested fine */
#include "settings.h"
#include "DHT.h"

DHT dht(DHTPIN, DHTTYPE);

const size_t MAX_CONTENT_SIZE = 512;
String privateKey;
bool authorized = false;
int processes = 0;

struct sAverage {
  int32_t blockSum;
  uint16_t numSamples;
};

struct sAverage sampleAve;
int16_t sensorTValue = 0;
int16_t sensorHValue = 0;

/*******************************************************
  postRequest
 *******************************************************/
void postRequest(WiFiClient* client, String url, JsonObject& jsonRoot, bool needKey) {
  String dataStr;
  jsonRoot.printTo(dataStr);
  
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
    //Serial.println(line); // output the response from server
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
    Serial.println("----------JWT token is Updated----------");

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
  digitalWrite(dhtPower, HIGH); //turn "On"
  float t;
  float f;
  float h;
  float hi;
  do {
    h = dht.readHumidity(); // Read Humidity
    t = dht.readTemperature(); // Read temperature in Celcius
    f = dht.readTemperature(true); // Read temperature in Fahrenheit
    hi = dht.computeHeatIndex(f, h);
  } while (isnan(t));

  Serial.println();
  Serial.println("------------------------------");
  Serial.print("\tHumidite: ");
  Serial.print(h);
  Serial.println(" %\t");
  Serial.print("\tTemperature: ");
  Serial.print(t);
  Serial.println(" *C");
  Serial.print("\tTemperature ressentie: ");
  Serial.print(dht.convertFtoC(hi));
  Serial.println(" *C");
  Serial.println("------------------------------");
  Serial.println();

  sensorTValue = t;
  sensorHValue = h;
  addSampleToAverage(&sampleAve, sensorTValue);

  delay(3000);
  digitalWrite(dhtPower, LOW); //turn "Off"
}

/*******************************************************
  getAverage
 *******************************************************/
int16_t getAverage(struct sAverage *ave) {
  int16_t average = ave->blockSum / ave->numSamples;
  ave->blockSum = 0; ave->numSamples = 0;
  return average;
}

/*******************************************************
  wifi
 *******************************************************/
void wifi() {
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
  delay(2000);
}

/*******************************************************
  setup
 *******************************************************/
void setup() {
  Serial.begin(115200);
  delay(100);
  dht.begin();
  
  Serial.println("Set to LOW so no power is flowing through the sensor");
  pinMode(dhtPower, OUTPUT);
}

/*******************************************************
  pleaseGoToBed
 *******************************************************/
void pleaseGoToBed() {
  Serial.println();
  Serial.println();
  Serial.println("Sleeping in few seconds...");
  delay(500);
  ESP.deepSleep(SLEEP_DELAY_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
}

/*******************************************************
  getSignedPayload
 *******************************************************/
String getSignedPayload(String payload) {
  ArduinoJWT jwt = ArduinoJWT(secret);
  return jwt.encodeJWT(payload);
}

/*******************************************************
  loop
 *******************************************************/
void loop() {
  readSample();
  wifi();

  if (WiFi.status() == WL_CONNECTED) {
    getJWToken(); //get authorization key
    const int BUFFER_SIZE = JSON_OBJECT_SIZE(25);
    StaticJsonBuffer<BUFFER_SIZE> jsonBufferT;
    StaticJsonBuffer<BUFFER_SIZE> jsonBufferTSigned;
    StaticJsonBuffer<BUFFER_SIZE> jsonBufferH;
    StaticJsonBuffer<BUFFER_SIZE> jsonBufferHSigned;

    // ------------------------------------------------------------ TEMPERATURE
    if ( sensorTValue > -1 && authorized == true ) {
      Serial.println("----------Sending data for Temperature----------");
      WiFiClient clientT;
      
      JsonObject& dataRootT = jsonBufferT.createObject();
      dataRootT["value"] = sensorTValue;
      dataRootT["flow_id"] = T_flow_id;
      dataRootT["mqtt_topic"] = T_mqtt_topic;
      dataRootT["unit"] = T_unit;
      dataRootT["save"] = T_save;
      dataRootT["publish"] = T_publish;
      
      Serial.print("POST ");
      Serial.print(host);
      Serial.print(" ");
      Serial.println(urlDataPoint);
      dataRootT.prettyPrintTo(Serial);
      Serial.println();
      Serial.println();

      JsonObject& dataRootTSigned = jsonBufferTSigned.createObject();
      String jsonStr;
      String signedJson;
      dataRootT.printTo(jsonStr);
      
      signedJson = getSignedPayload( jsonStr );
      dataRootTSigned["signedPayload"] = signedJson;
      dataRootTSigned["object_id"] = object_id;
      dataRootTSigned.prettyPrintTo(Serial);
      Serial.println();
      
      String jsonStrSigned;
      dataRootTSigned.printTo(jsonStrSigned);
      
      if ( !clientT.connect(host, httpPort) ) {
        Serial.println("connection failed");
        return;
      } else {
        postRequest(&clientT, urlDataPoint, dataRootTSigned, true);
      }
    }
    // ------------------------------------------------------------ END TEMPERATURE

    // ------------------------------------------------------------ HUMIDITY
    if ( sensorHValue > -1 && authorized == true ) {
      Serial.println("----------Sending data for Humidity----------");
      WiFiClient clientH;
      
      JsonObject& dataRootH = jsonBufferH.createObject();
      dataRootH["value"] = sensorHValue;
      dataRootH["flow_id"] = H_flow_id;
      dataRootH["mqtt_topic"] = H_mqtt_topic;
      dataRootH["unit"] = H_unit;
      dataRootH["save"] = H_save;
      dataRootH["publish"] = H_publish;
      
      Serial.print("POST ");
      Serial.print(host);
      Serial.print(" ");
      Serial.println(urlDataPoint);
      dataRootH.prettyPrintTo(Serial);
      Serial.println();

      JsonObject& dataRootHSigned = jsonBufferHSigned.createObject();
      String jsonStr;
      String signedJson;
      dataRootH.printTo(jsonStr);
      
      signedJson = getSignedPayload( jsonStr );
      dataRootHSigned["signedPayload"] = signedJson;
      dataRootHSigned["object_id"] = object_id;
      dataRootHSigned.prettyPrintTo(Serial);
      Serial.println();
      Serial.println();
      
      String jsonStrSigned;
      dataRootHSigned.printTo(jsonStrSigned);
      
      if ( !clientH.connect(host, httpPort) ) {
        Serial.println("connection failed");
        return;
      } else {
        postRequest(&clientH, urlDataPoint, dataRootHSigned, true);
      }
    }
    // ------------------------------------------------------------ END HUMIDITY
  }
  delay(5000); // to get the answer
  pleaseGoToBed();
}
