#include <ESP8266WiFi.h>
#include <ArduinoHttpClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define SLEEP_DELAY_IN_SECONDS  1800    // 30 minutes
#define ONE_WIRE_BUS            D4      // DS18B20 pin

const char* ssid = "WIFI SSID";
const char* password = "WIFI PASSWD";
const char* flow_id = "t6 Flow ID";
const char* object_id = "t6 Object ID";
const char* Bearer = "t6 Bearer token";
String response;
int statusCode = 0;
WiFiClient wifi;
WiFiClient client;
IPAddress server(192,168,0,22);
int status = WL_IDLE_STATUS;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
char temperatureString[6];

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Waiting for connection");
  }
  // setup OneWire bus
  DS18B20.begin();
}

float getTemperature() {
  //Serial << "Requesting DS18B20 temperature..." << endl;
  float temp;
  do {
    DS18B20.requestTemperatures(); 
    temp = DS18B20.getTempCByIndex(0);
    delay(100);
  } while (temp == 85.0 || temp == (-127.0));
  return temp;
}

void httpRequest(String postData) {
  client.stop();
  if (client.connect(server, 3000)) {
    Serial.println("connecting...");
    client.println("POST /v2.0.1/data/ HTTP/1.1");
    client.println("Authorization: Bearer " + String(Bearer));
    client.println("Host: bleu");
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

void loop() {
  if(WiFi.status()== WL_CONNECTED) {
    float temperature = getTemperature();
    // convert temperature to a string with two digits before the comma and 2 digits for precision
    dtostrf(temperature, 2, 2, temperatureString);
    
    char* contentType = "application/json";
    String postData = String("{ \"flow_id\":\"" + String(flow_id) + "\", \"value\":\"" + String(temperatureString) + "\", \"timestamp\": \"\", \"publish\": \"true\", \"save\": \"true\" }");
    Serial.println("");
    Serial.println(postData);

    httpRequest(postData);

    Serial.println("Wait 30 minutes");

    //Serial << "Entering deep sleep mode for " << SLEEP_DELAY_IN_SECONDS << " seconds..." << endl;
    ESP.deepSleep(SLEEP_DELAY_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
  }
  delay(1800000);  //Send a request every 30 minutes
}
