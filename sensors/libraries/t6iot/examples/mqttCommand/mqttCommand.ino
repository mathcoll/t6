/*
  mqttCommand.ino -
  Created by mathieu@internetcollaboratif.info <Mathieu Lory>.
  Sample file to connect t6 mqtt and receive commands.
  POST command having the following payload to any flow:
    { "text": "This event will command the Object and set Light to ON/OFF",
      "value": "0", "save": "false", "object_id": "a06dfa8a-ddeb-4bf6-885a-6fb4f1f84b01" }
  
  - t6 iot: https://api.internetcollaboratif.info
  - Api doc: https://api.internetcollaboratif.info/docs/

*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

char* objectId = ""; // The current object ID
const char* ssid = ""; // Your Wifi SSID
const char* password = ""; // Your Wifi password
const char* mqtt_server = "api.internetcollaboratif.info";
const int mqtt_port = 1883;
String clientPrefixId = "ESP8266Client-";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
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

  randomSeed(micros());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  
  if ((char)payload[0] == '1') {
  	// Switch on the LED if an 1 was received as first character
    digitalWrite(BUILTIN_LED, LOW);
  } else if ((char)payload[0] == '0') {
  	// Switch off the LED if an 0 was received as first character
    digitalWrite(BUILTIN_LED, HIGH);
  } else {
  	// Switch off the LED if any other payload is comming
    digitalWrite(BUILTIN_LED, HIGH);
  }
}

void reconnect() {
  while (!client.connected()) {
    String clientId = clientPrefixId+String(random(0xffff), HEX);
    Serial.println("MQTT connection...");
    if (client.connect(clientId.c_str())) {
      client.subscribe(("+/+/+/object_id/"+String(objectId)+"/cmd").c_str ());
      Serial.println("subscribed.");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BUILTIN_LED, OUTPUT);
  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
