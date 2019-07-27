
#include <ESP8266WiFi.h>
#include <ArduinoJson.h> /* ArduinoJson 5.13.14 tested fine */
#include "settings.h"
#include <SFE_BMP180.h>
#include <Wire.h>

SFE_BMP180 pressure;

const size_t MAX_CONTENT_SIZE = 512; 
String privateKey;
bool authorized = false;
int processes = 0;

struct sAverage {
  int32_t blockSum;
  uint16_t numSamples;
};

struct sAverage sampleAve;
int16_t sensorPValue = 0;

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
  Serial.print("Response length:");
  Serial.println(client.available());

  client.setTimeout(5000); //in case things get stuck

  //read http header lines
  while (client.available()) {
    String line = client.readStringUntil('\n');
    //Serial.println(line);
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
  char status;
  double T,P,p0,a;
  Serial.println();
  Serial.print("provided altitude: ");
  Serial.print(ALTITUDE,0);
  Serial.print(" meters, ");
  Serial.print(ALTITUDE*3.28084,0);
  Serial.println(" feet");
  
  // You must first get a temperature measurement to perform a pressure reading.
  
  // Start a temperature measurement:
  // If request is successful, the number of ms to wait is returned.
  // If request is unsuccessful, 0 is returned.

  status = pressure.startTemperature();
  if (status != 0) {
    // Wait for the measurement to complete:
    delay(status);

    // Retrieve the completed temperature measurement:
    // Note that the measurement is stored in the variable T.
    // Function returns 1 if successful, 0 if failure.

    status = pressure.getTemperature(T);
    if (status != 0) {
      // Print out the measurement:
      Serial.print("temperature: ");
      Serial.print(T,2);
      Serial.print(" deg C, ");
      Serial.print((9.0/5.0)*T+32.0,2);
      Serial.println(" deg F");
      
      // Start a pressure measurement:
      // The parameter is the oversampling setting, from 0 to 3 (highest res, longest wait).
      // If request is successful, the number of ms to wait is returned.
      // If request is unsuccessful, 0 is returned.

      status = pressure.startPressure(3);
      if (status != 0) {
        // Wait for the measurement to complete:
        delay(status);

        // Retrieve the completed pressure measurement:
        // Note that the measurement is stored in the variable P.
        // Note also that the function requires the previous temperature measurement (T).
        // (If temperature is stable, you can do one temperature measurement for a number of pressure measurements.)
        // Function returns 1 if successful, 0 if failure.

        status = pressure.getPressure(P,T);
        if (status != 0) {
          // Print out the measurement:
          Serial.print("absolute pressure: ");
          Serial.print(P,2);
          Serial.print(" mb, ");
          Serial.print(P*0.0295333727,2);
          Serial.println(" inHg");
          
          sensorPValue = P;

          // The pressure sensor returns absolute pressure, which varies with altitude.
          // To remove the effects of altitude, use the sea level function and your current altitude.
          // This number is commonly used in weather reports.
          // Parameters: P = absolute pressure in mb, ALTITUDE = current altitude in m.
          // Result: p0 = sea-level compensated pressure in mb

          p0 = pressure.sealevel(P,ALTITUDE); // we're at 1655 meters (Boulder, CO)
          Serial.print("relative (sea-level) pressure: ");
          Serial.print(p0,2);
          Serial.print(" mb, ");
          Serial.print(p0*0.0295333727,2);
          Serial.println(" inHg");

          // On the other hand, if you want to determine your altitude from the pressure reading,
          // use the altitude function along with a baseline pressure (sea-level or other).
          // Parameters: P = absolute pressure in mb, p0 = baseline pressure in mb.
          // Result: a = altitude in m.

          a = pressure.altitude(P,p0);
          Serial.print("computed altitude: ");
          Serial.print(a,0);
          Serial.print(" meters, ");
          Serial.print(a*3.28084,0);
          Serial.println(" feet");
        }
        else Serial.println("error retrieving pressure measurement\n");
      }
      else Serial.println("error starting pressure measurement\n");
    }
    else Serial.println("error retrieving temperature measurement\n");
  }
  else Serial.println("error starting temperature measurement\n");

  delay(10000);
  Serial.println("------------------------------");
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
 setup
 *******************************************************/
void setup() {
  Serial.begin(115200);
  delay(100);
  if (pressure.begin()) {
    Serial.println("BMP180 init success");
  } else {
    Serial.println("BMP180 init fail\n\n");
    while(1); // Pause forever.
  }
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
 loop
 *******************************************************/
void loop() {
  readSample();
  Serial.println();
  Serial.println("------------------------------");
  Serial.print("\tAverage Pressure: "); 
  Serial.print(sensorPValue);
  Serial.println(" mBar");
  Serial.println("------------------------------");
  Serial.println();
  
  wifi();
  
  if(WiFi.status()== WL_CONNECTED) {
    getJWToken(); //get authorization key
    if ( !privateKey || authorized == false ) {
      //getJWToken();
    }
    
    const int BUFFER_SIZE = JSON_OBJECT_SIZE(6);
    StaticJsonBuffer<BUFFER_SIZE> jsonBufferP;
   
    // ------------------------------------------------------------ PRESSURE
    if ( sensorPValue && authorized == true ) {
      Serial.println("----------Sending data for Temperature----------");
      WiFiClient clientP;
      if (!clientP.connect(host, httpPort)) {
        Serial.println("connection failed");
        return;
      }
      JsonObject& dataRootP = jsonBufferP.createObject();
      dataRootP["value"] = sensorPValue;
      dataRootP["flow_id"] = P_flow_id;
      dataRootP["object_id"] = object_id;
      dataRootP["mqtt_topic"] = P_mqtt_topic;
      dataRootP["unit"] = P_unit;
      dataRootP["save"] = P_save;
      dataRootP["publish"] = P_publish;
      Serial.println(urlDataPoint);
      dataRootP.prettyPrintTo(Serial);
      Serial.println();
      //Serial.print("\tUsing Bearer ");
      //Serial.println(privateKey);
      postRequest(&clientP, urlDataPoint, dataRootP, true);
      
      if (authorized == false) {
        //getJWToken();
      } else {
        Serial.println("-------------------------");
      }
    }
    // ------------------------------------------------------------ END TEMPERATURE
  }

  delay(6000); // to get the answer
  pleaseGoToBed();
}
