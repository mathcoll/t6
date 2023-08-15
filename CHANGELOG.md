# t6 Api&PWA Changelog
All notable changes to this project will be documented in this file.
  - [x] : Task completed
  - [ ] : Task not started or even not completed
  - :sos: : please refers to [CONTRIBUTING.md](../blob/master/CONTRIBUTING.md) in case you would like to help :-)
  - :ballot_box_with_check: : Task completed but no longer activated today - deprecated

Types of changes
  - `Added` for new features.
  - `Changed` for changes in existing functionality.
  - `On hold` for expected features but not implemented.
  - `Deprecated` for soon-to-be removed features.
  - `Removed` for now removed features.
  - `Fixed` for any bug fixes.
  - `Security` in case of vulnerabilities.

------------

## 2023
### Milestone 26 - 2023-
**Added**
  - [x] Adding new route to get Audit Logs with some parameters to filter results
  - [x] Allows to set customRules on datapoints
  - [x] Additional Rule Engine eventType: replaceWithDistance. This event will get the distance in meter between an Object and the longitude-latitude passed along the datapoint payload

**Fixed**
  - [x] 

**Changed**
  - [x] Remove BCC on /mail/changePassword

### Milestone 25 - 2023-07
**Added**
  - [x] New endpoints to handle `Models` resources as CRUD
  - [x] New Machine Learning module including training Endpoint
  - [x] Added normalize boolean parameter to Models
  - [x] Allows to upload custom Models binary and weight files
  - [x] Store measurements including meta information about predicted categorie - using Machine Learning and Models

**Fixed**
  - [x] Allows for custom timestamp with several date formatting as input
  - [x] Rename attribute in GA4 "environment" as it was mispelled with double "n" before
  - [x] Fix Integer on preprocessor

**Changed**
  - [x] allows for custom timestamp with any RFC formatted date as input
  - [x] RuleEngine on a synchroneous process so that annotation from RuleEngine can be stored to influxDb
  - [x] Packages updates @vladmandic/face-api@1.7.10 @influxdata/influxdb-client@1.33.2 @tensorflow/tfjs-node@4.4.0 acorn@8.8.2 body-parser@1.20.2 canvas@2.11.2 express-jwt@8.4.1 firebase-admin@11.6.0 fs-extra@11.1.1 geoip-lite@1.4.7 graceful-fs@4.2.11 jsdom@21.1.1 lighthouse@10.1.0 minimist@1.2.8 nodemailer@6.9.1 npm@9.6.4 qs@6.11.1 simple-statistics@7.8.3 twilio@4.10.0 validator@13.9.0 ws@8.13.0

## 2023
### Milestone 24 - 2023-03
**Added**
  - [x] Implement tts (Text To Speech) to sockets
  - [x] Added welcoming sound to sockets that can be played on ESP device
  - [x] Adding "getObjects" to sockets functions in order to list all connected Objects from current user

**Fixed**
  - [x] Fix OTP challenge rules

**Changed**
  - [x] Switched otp to x-otp headers
  - [x] Changed `text` datapoint attribute to `meta` when posting new Measurement.

### Milestone 23 - 2023-02
**Added**
  - [x] Added OTP/2FA challenge as MVP on the authenticate process
  - [x] Improve UI for OTP/2FA
  - [x] Added a threashold (otpBruteForceCount) to settings that trigger an OTP challenge

**Fixed**
  - [x] Fixed case in-sensitive on login/account creation

**Changed**
  - [x] Packages updates d3-node@3.0.0 firebase-admin@11.5.0
  - [x] OTP/2FA on a challenge must be sent via additional headers (hash, otp)

### Milestone 22 - 2023-01
**Added**
  - [x] webSocket allows `remindMeToMeasure` command

**Fixed**
  - [x] Ifttt trigger and oAuth2 process

**Changed**
  - [x] Improve UI for Objects
  - [x] Packages updates jsonwebtoken@9.0.0 ws@8.12.0 twilio@3.84.1 @influxdata/influxdb-client@1.33.0 @tensorflow/tfjs-node@4.2.0 @vladmandic/face-api@1.7.8 canvas@2.11.0 nodemailer@6.9.0 npm@9.3.1 qs@6.11.0 simple-statistics@7.8.2 fs-extra@11.1.0

## 2022
### Milestone 21 - 2022-10
**Added**
  - [x] webSocket claim object using a signed payload
  - [x] webSocket client can suscribe and unsubscribe to custom channels
  - [x] webSocket multicast command using channel subscription on sockets
  - [x] webSocket allows `audioOutput` as command to interface with Arduino TTS
  - [x] webSocket claimed Objects are identified as "connected" in t6 UI the same way they are from the mqtt dedicated topic
  
**Changed**
  - [x] Mqtt topic settings customizable from environment file
  - [x] webSocket welcoming message is returning a claimRequest to the client
  - [x] webSocket on t6 Rule must be a json payload instead of a String - they still can contains `{value}` to substitute current datapoint value

### Milestone 20 - 2022-09
**Fixed**
  - [x] Fixed conflicting names on variables
  - [x] Fixed bug on getObjectKey

**Added**
  - [x] Add webSocket server on t6
  - [x] Add webSocket trigger to Rule Engine
  - [x] Allow Api-Key+Api-secret headers on datapoint post when adding a measurement
  - [x] Allow accessTokens to customize duration "1d","1w","1M","1y"

### Milestone 19 - 2022-08
**Fixed**
  - [x] Fixed default retention policy from the flow on GET /data/$flow_id Endpoint

### Milestone 18 - 2022-02
**Added**
  - [x] Added screens to list, add, and edit `Stories`
  - [x] Added `Stories` display linked from the resource in App UI

**Fixed**
  - [x] Fixed monthly Report notification batch reccuring
  - [x] Fixed Flow display UI using the new Api endpoint for exploration/line

**Changed**
  - [x] Remove Chartjs library and use svg output instead
  - [x] Updated Open Layers library
  - [x] Updated Leaflet library
  - [x] Updated Material Design Lite library
  - [x] Updated Moment library

**Security**
  - [x] Updated node dependencies for @vladmandic/face-api apidoc canvas firebase-admin follow-redirects influx mqtt npm suncalc twilio
  
### Milestone 17 - 2022-01
**Added**
  - [x] Monitoring using dashboard from influxData.
  - [x] Add `Stories` resources available for POST, GET, PUT, DELETE

**Fixed**
  - [x] Payload image detection. The image identification was only made by a simple base64 string, the current implementation is using a dedicated package to image-type.

**Changed**
  - [x] Returns a 204 status code when Admin emails does not need to send message to any recipient.
  - [x] Decision Rule: Display a relative diff on email instead of a absolute value

## 2021
### Milestone 16 - 2021-11
**Changed**
  - [x] autogen.events contains importants application logs
  - [x] quota4w.requests contains users api calls for statistical purpose ; wirth a monthly retention. This timeseries is used for the monthly report
  - [x] 2021-11-14 : moved `session_id` from tag to ̀field in `requests` measurement.

**Added**
  - [x] Data labeling and annotation: collection and Api for Categories
  - [x] Data labeling and annotation: collection and Api for Annotations
  - [x] Data labeling and annotation: `Rule Engine` can prorammatically annotate datapoints based on rule trigger

### Milestone 15 - 2021-10
**Fixed**
  - [x] Fixed signature on datapoint storage
  - [x] Fix pushNotification and error handling
  - [x] t6 stabilization  

**Changed**
  - [x] [22cc04e](https://github.com/mathcoll/t6/commit/22cc04e398f9a33c8375a7bf243328fcf1c518e4) News start service using systemd instead of /etc/init.d

**Security**
  - [x] [39bcfee](https://github.com/mathcoll/t6/commit/39bcfeef34006ae60be383bf46e8709c77934a51) disable HTTP header "x-powered-by"

**Added**
  - [x] Twilio Proof Of Concept ; not yet fully functionnal

### Milestone 14 - 2021-09: Image Preprocessing
**Added**
  - [x] Api {get} /exploration/:flow_id/exploration is removed - was marked as deprecated for 10 months. 
  - [x] Cutom Datapoints Retention Policy on Flows
  - [x] "Requests" database Retention Policy moved from 1 week to 30 days
  - [x] Activating Monthly Activity Report by email for user calling the Api in the past 30 days (using "Requests" database)
  - [x] Image preprocessing including Face, Age, Gender and Facial Expression recognition

### Milestone 13 - 2021-06: Sensor Data Fusion
**Added**
  - [x] Send multiple datapoints (measurements) from the same payload - using an Array
  - [x] [Sensor Data Fusion](https://api.internetcollaboratif.info/news/2021-06-16-newsletter-sensor-data-fusion)
  - [x] Customize Tracks on Flows
  - [x] Timed buffer on preprocessor to fuse and combine multiple measurements together
  - [x] Payload value transformation/sanitization/convertion using a preprocessor when measurement is sent

**On hold**
  - [ ] Customize Ttl on each Flows - not completed or [buggy](https://github.com/techfort/LokiJS/issues/884). :sos:
  
### Milestone 12 - 2021-05: InfluxData Cloud secondary storage (as an option)
**Added**
  - [x] UI modifications to edit InfluxData Cloud token information
  - [x] Customize Payload to allow storing datapoint on InfluxData Cloud
  - [x] Customize Flows to allow storing datapoint on InfluxData Cloud

**On hold**
  - [ ] Use only one library (instead of 2!) to write datapoints to both timeseries InfluxDb and InfluxData Cloud

### Milestone 11 - 2021-04: Sensor-Data-Fusion
**Added**
  - [x] Implement internal Preprocessor to Validate, Sanitize, Convert and/or Transform input payload values
  - [x] Dispatch write datapoints to telegraf instead of influxDB
  - [x] Instantiate a telegraf server
  - [x] Create separate branch for sensor-Fusion
#### Removed
  - [ ] ~~Add processor to telegraf to customize fusion~~

### Milestone 10 - 2021-02: Objects localization / maps
**Added**
  - [x] Add a dedicated page (#objects-maps) to locate objects on a map

**On hold**
  - [ ] :sos: Add filters to #objects-maps to customize displays
  - [ ] :sos: Add an operator on t6 rule engine to update Object attribute like the latitude/longitude. This feature will make available the localization on the map

## 2020
### Milestone 9 - 2020-10: Svg outputs
**Changed**
  - [x] Output svg on all EDA Endpoints

**On hold**
  - [ ] :sos: Rebuild all Snippets using its own svg api from t6
  - [ ] no more chart.js library as dependency
  
### Milestone 8 - 2020-10: Exploratory data analysis (EDA)
**Added**
  - [x] Filter on 1 source to get graphical and non graphical EDA results
  - [x] [Head and Tail](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Summary statistics](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Frequency shape distribution](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Boxplot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [simple Plot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Loess](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)

**On hold**
  - [ ] :sos: EDA List distinct facts
  - [ ] :sos: EDA List distinct categories
  
### Milestone 7 - 2020-04: Over The Air Deployment
**Added**
  - [x] [Update Arduino source code Over The Air - using Wifi](https://api.internetcollaboratif.info/news/2020-04-11-newsletter-ota)

### Milestone 6 - 2020-03: Add Decision Rules Algorithm
**Added**
  - [x] [Algorithm linear regression for basic prediction/anomaly detection](https://api.internetcollaboratif.info/news/2020-03-10-newsletter-linearegression)

## 2019
### Milestone 5 - 2019-06: Process with a better TSdb database integration - anything but SQLite
**Changed**
  - [x] influxDb branch is live and running.
  - [x] :ballot_box_with_check: SQLite database ~~still can be activated as backup or alternative~~ [is deprecated and not maintained](https://github.com/mathcoll/t6/commit/4a6db17f26fdd1cc24413a6b67d49918149aa7fb)
  
### Milestone 4 - 2019-05: Add Security to POST datapoints payloads
**Added**
  - [x] Signature on datapoint POST
  - [x] Crypt AES 256 cbc on datapoint POST
  - [x] Flows allows to force signature and/or encryption when datapoints are POSTed

### Milestone 3 - 2019-05: Implement additional snippets
**Added**
  - [ ] :x: ~~Maps snippets, that could help for a geolocalization/geotracing~~ This feature become depredated as the #objects-maps allows to locate all objects on the map.
  - [x] Graphs snippets

## Before 2019
### Milestone 2 - 2016-04: Dashboard integration
**Added**
  - [x] Dashboards are fully integrated into the UI
  - [x] Some snippets are available to see graphs, display a simple value (like temperature), or display current date

### Milestone 1 - 2016: API completion
**Added**
  - [x] 3 resources are fully manageable via Apis
  - [x] 3 resources are remaining todo (rules, snippets and dashboards)

### Milestone 0 - 2016: API basics and simple UI to manage most of resources
**Added**
  - [x] POST, GET, PUT, DELETE on all resources
  - [x] The Api is handling and storing datapoints on each flows

### Milestone -1 - 2012-2013: First code to collect measurements from sensors
**Added**
  - [x] Collect measurement as a Proof Of Concept - not using any Api
  - [x] Store measure to SQLite Db
