#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

static const int RXPin = 5, TXPin = 4;
static const uint32_t GPSBaud = 9600;

const char* host = "192.168.0.15"; // t6 server IP Address
const int httpPort = 3000;
const char* urlJWT = "/v2.0.1/authenticate";
const char* urlDataPoint = "/v2.0.1/data";
const char* object_id = ""; //LOC
const size_t MAX_CONTENT_SIZE = 512; 
String privateKey;
bool authorized = false;
int processes = 0;
#define SLEEP_DELAY_IN_SECONDS  1800    // 30 minutes

// JWT Authentication
const char* loginEmail = "";
const char* loginPass = "";

// Flow for GPS
const char* flow_id = "";
const char* mqtt_topic = "couleurs/nodeMCU/gps/position";
const char* unit = "";
const char* save = "true";
const char* publish = "true";

// Wifi
const char* ssid = "";
const char* password = "";

TinyGPSPlus gps; // The TinyGPS++ object
SoftwareSerial ss(RXPin, TXPin);  // The serial connection to the GPS device

float spd;       //Variable  to store the speed
float alt;       //Variable  to store the altitude
float cou;       //Variable  to store the course
float sats;      //Variable to store no. of satellites response
String bearing;  //Variable to store orientation or direction of GPS
double lon = X.XXXXXX;
double lat = X.XXXXXX;
int timezone = 2;



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
 pleaseGoToBed
 *******************************************************/
void pleaseGoToBed() {
    Serial.println();
    Serial.println();
    Serial.println("Sleeping in few seconds...");
    delay(500);
    ESP.deepSleep(SLEEP_DELAY_IN_SECONDS * 1000000, WAKE_RF_DEFAULT);
}


//Function extracted from the library http://playground.arduino.cc/Code/Time
//if you just need the function without compiling few kbs and you need to save 
//space, this is the way to go

#define SECS_PER_MIN  (60UL)
#define SECS_PER_HOUR (3600UL)
#define SECS_PER_DAY  (SECS_PER_HOUR * 24UL)

// leap year calulator expects year argument as years offset from 1970
#define LEAP_YEAR(Y)     ( ((1970+Y)>0) && !((1970+Y)%4) && ( ((1970+Y)%100) || !((1970+Y)%400) ) )
static  const uint8_t monthDays[]={31,28,31,30,31,30,31,31,30,31,30,31}; // API starts months from 1, this array starts from 0

long makeTime(int hr,int min,int sec,int dy, int mnth, int yr){   
  // assemble time elements into time_t 
  // note year argument is offset from 1970 (see macros in time.h to convert to other formats)
  // previous version used full four digit year (or digits since 2000),i.e. 2009 was 2009 or 9
  
  // year can be given as full four digit year or two digts (2010 or 10 for 2010);  
  //it is converted to years since 1970
  if( yr > 99)
      yr = yr - 1970;
  else
      yr += 30;  

  int i;
  uint32_t seconds;

  // seconds from 1970 till 1 jan 00:00:00 of the given year
  seconds= yr*(SECS_PER_DAY * 365);
  for (i = 0; i < yr; i++) {
    if (LEAP_YEAR(i)) {
      seconds +=  SECS_PER_DAY;   // add extra days for leap years
    }
  }
  
  // add days for this year, months start from 1
  for (i = 1; i < mnth; i++) {
    if ( (i == 2) && LEAP_YEAR(yr)) { 
      seconds += SECS_PER_DAY * 29;
    } else {
      seconds += SECS_PER_DAY * monthDays[i-1];  //monthDay array starts from 0
    }
  }
  seconds+= (dy-1) * SECS_PER_DAY;
  seconds+= hr * SECS_PER_HOUR;
  seconds+= min * SECS_PER_MIN;
  seconds+= sec;
  return (long)seconds; 
}











void setup() {
  Serial.begin(115200);
  ss.begin(GPSBaud);
  
  Serial.print(F("TinyGPS++ library v. "));
  Serial.println(TinyGPSPlus::libraryVersion());
  Serial.println();
}

void loop() {
  while (ss.available() > 0) {
    if (gps.encode(ss.read()))
      displayInfo();
  }
  
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    Serial.println(F("No GPS detected: check wiring."));
    //while(true);
    delay(2000);
  }
}

void displayInfo() {
  if (gps.speed.isValid()) {
    spd = gps.speed.kmph();
    Serial.print(F("  Speed: "));
    Serial.println(spd);
  }
    
  if (gps.satellites.isValid()) {
    sats = gps.satellites.value();
    Serial.print(F("  Satellites: "));
    Serial.println(sats);
  }
    
  if (gps.altitude.kilometers()) {
    alt = gps.altitude.kilometers();
    Serial.print(F("  Altitude: "));
    Serial.println(alt);
  }
    
  if (gps.course.deg()) {
    cou = gps.course.deg();
    Serial.print(F("  course: "));
    Serial.println(cou);
  }
  
  if (gps.date.isValid()) {
    Serial.print(F("  Date/Time: "));
    Serial.print(gps.date.month());
    Serial.print(F("/"));
    Serial.print(gps.date.day());
    Serial.print(F("/"));
    Serial.print(gps.date.year());
    Serial.print(F(" "));
  }
 
  if (gps.time.isValid()) {
    if (gps.time.hour()+timezone < 10) Serial.print(F("0"));
    Serial.print(gps.time.hour()+timezone);
    Serial.print(F(":"));
    if (gps.time.minute() < 10) Serial.print(F("0"));
    Serial.print(gps.time.minute());
    Serial.print(F(":"));
    if (gps.time.second() < 10) Serial.print(F("0"));
    Serial.print(gps.time.second());
    Serial.print(F("."));
    if (gps.time.centisecond() < 10) Serial.print(F("0"));
    Serial.print(gps.time.centisecond());
    Serial.print(F(" "));
  }

  if (gps.date.isValid() && gps.time.isValid()) {
    Serial.print(F(" "));
    Serial.print(F("Unixepoch:"));
    Serial.print( makeTime(gps.time.hour(), gps.time.minute(), gps.time.second(), gps.date.day(), gps.date.month(), gps.date.year()) );
    Serial.print(F(" "));
  }
  
  if (gps.location.isValid()) {
    Serial.print(F("Location: "));
    double latitude = (gps.location.lat());
    double longitude = (gps.location.lng());
    
    String latbuf;
    latbuf += (String(latitude, 6));
    Serial.print(F("Lat "));
    Serial.print(latbuf);
    Serial.print(F(" ; "));
 
    String lonbuf;
    lonbuf += (String(longitude, 6));
    Serial.print(F("Lon "));
    Serial.println(lonbuf);

    Serial.print(F("  Distance to Home: "));
    Serial.print( gps.distanceBetween(lat, lon, latitude, longitude) );
    Serial.println(F("meters."));


    wifi();
    if(WiFi.status()== WL_CONNECTED) {
      getJWToken(); //get authorization key
      if ( !privateKey || authorized == false ) {
        //getJWToken();
      }
      
      const int BUFFER_SIZE = JSON_OBJECT_SIZE(6);
      StaticJsonBuffer<BUFFER_SIZE> jsonBufferT;

      if ( authorized == true ) {
        Serial.println("----------Sending data----------");
        WiFiClient clientT;
        if (!clientT.connect(host, httpPort)) {
          Serial.println("connection failed");
          return;
        }
        JsonObject& dataRootT = jsonBufferT.createObject();
        dataRootT["value"] = latbuf+";"+lonbuf;
        dataRootT["flow_id"] = flow_id;
        dataRootT["mqtt_topic"] = mqtt_topic;
        dataRootT["unit"] = unit;
        dataRootT["save"] = save;
        dataRootT["publish"] = publish;
        Serial.println(urlDataPoint);
        dataRootT.prettyPrintTo(Serial);
        Serial.println();
        postRequest(&clientT, urlDataPoint, dataRootT, true);
      }
    }
    //pleaseGoToBed();
  }
  
  Serial.println();

  delay(10000);
}
