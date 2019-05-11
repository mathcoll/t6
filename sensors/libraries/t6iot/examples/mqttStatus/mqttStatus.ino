/*
  mqttCommand.ino -
  Created by mathieu@internetcollaboratif.info <Mathieu Lory>.
  Sample file to set Object status to mqtt.
  
  - t6 iot: https://api.internetcollaboratif.info
  - Api doc: https://api.internetcollaboratif.info/docs/

*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "settings.h"

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

void reconnect() {
  while ( !client.connected() ) {
    String clientId = clientPrefixId+String(random(0xffff), HEX);
    Serial.println("MQTT connection...");
    if ( client.connect(clientId.c_str(), ("objects/status/"+String(objectId)).c_str (), 1, true, "0") ) {
      client.publish(("objects/status/"+String(objectId)).c_str (), "1");
      //client.subscribe(("+/+/+/object_id/"+String(objectId)+"/cmd").c_str ());
      //Serial.println("subscribed.");
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
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}
