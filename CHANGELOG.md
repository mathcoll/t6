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

## 2022
### Milestone 18 - 2022-02
#### Added
  - [x] Added screens to list, add, and edit `Stories`
  - [x] Added `Stories` display linked from the resource in App UI

#### Fixed
  - [x] Fixed monthly Report notification batch reccuring
  - [x] Fixed Flow display UI using the new Api endpoint for exploration/line
  
#### Changed
  - [x] Remove Chartjs library and use svg output instead
  - [x] Updated Open Layers library
  - [x] Updated Leaflet library
  - [x] Updated Material Design Lite library
  - [x] Updated Moment library
  - [x] Updated node dependncies for @vladmandic/face-api apidoc canvas firebase-admin follow-redirects influx mqtt npm suncalc twilio
  
### Milestone 17 - 2022-01
#### Added
  - [x] Monitoring using dashboard from influxData.
  - [x] Add `Stories` resources available for POST, GET, PUT, DELETE

#### Fixed
  - [x] Payload image detection. The image identification was only made by a simple base64 string, the current implementation is using a dedicated package to image-type.

#### Changed
  - [x] Returns a 204 status code when Admin emails does not need to send message to any recipient.
  - [x] Decision Rule: Display a relative diff on email instead of a absolute value

## 2021
### Milestone 16 - 2021-11
#### Fixed
#### Changed
  - [x] autogen.events contains importants application logs
  - [x] quota4w.requests contains users api calls for statistical purpose ; wirth a monthly retention. This timeseries is used for the monthly report
  - [x] 2021-11-14 : moved `session_id` from tag to ̀field in `requests` measurement.

#### Added
  - [x] Data labeling and annotation: collection and Api for Categories
  - [x] Data labeling and annotation: collection and Api for Annotations
  - [x] Data labeling and annotation: `Rule Engine` can prorammatically annotate datapoints based on rule trigger

### Milestone 15 - 2021-10
#### Fixed
  - [x] Fixed signature on datapoint storage
  - [x] Fix pushNotification and error handling
  - [x] t6 stabilization  
#### Changed
  - [x] [22cc04e](https://github.com/mathcoll/t6/commit/22cc04e398f9a33c8375a7bf243328fcf1c518e4) News start service using systemd instead of /etc/init.d
#### Security
  - [x] [39bcfee](https://github.com/mathcoll/t6/commit/39bcfeef34006ae60be383bf46e8709c77934a51) disable HTTP header "x-powered-by"
#### Added
  - [x] Twilio Proof Of Concept ; not yet fully functionnal

### Milestone 14 - 2021-09: Image Preprocessing
#### Added
  - [x] Api {get} /exploration/:flow_id/exploration is removed - was marked as deprecated for 10 months. 
  - [x] Cutom Datapoints Retention Policy on Flows
  - [x] "Requests" database Retention Policy moved from 1 week to 30 days
  - [x] Activating Monthly Activity Report by email for user calling the Api in the past 30 days (using "Requests" database)
  - [x] Image preprocessing including Face, Age, Gender and Facial Expression recognition

### Milestone 13 - 2021-06: Sensor Data Fusion
#### Added
  - [x] Send multiple datapoints (measurements) from the same payload - using an Array
  - [x] [Sensor Data Fusion](https://api.internetcollaboratif.info/news/2021-06-16-newsletter-sensor-data-fusion)
  - [x] Customize Tracks on Flows
  - [x] Timed buffer on preprocessor to fuse and combine multiple measurements together
  - [x] Payload value transformation/sanitization/convertion using a preprocessor when measurement is sent
#### On hold
  - [ ] Customize Ttl on each Flows - not completed or [buggy](https://github.com/techfort/LokiJS/issues/884). :sos:
  
### Milestone 12 - 2021-05: InfluxData Cloud secondary storage (as an option)
#### Added
  - [x] UI modifications to edit InfluxData Cloud token information
  - [x] Customize Payload to allow storing datapoint on InfluxData Cloud
  - [x] Customize Flows to allow storing datapoint on InfluxData Cloud
#### On hold
  - [ ] Use only one library (instead of 2!) to write datapoints to both timeseries InfluxDb and InfluxData Cloud

### Milestone 11 - 2021-04: Sensor-Data-Fusion
#### Added
  - [x] Implement internal Preprocessor to Validate, Sanitize, Convert and/or Transform input payload values
  - [x] Dispatch write datapoints to telegraf instead of influxDB
  - [x] Instantiate a telegraf server
  - [x] Create separate branch for sensor-Fusion
#### Removed
  - [ ] ~~Add processor to telegraf to customize fusion~~

### Milestone 10 - 2021-02: Objects localization / maps
#### Added
  - [x] Add a dedicated page (#objects-maps) to locate objects on a map
#### On hold
  - [ ] :sos: Add filters to #objects-maps to customize displays
  - [ ] :sos: Add an operator on t6 rule engine to update Object attribute like the latitude/longitude. This feature will make available the localization on the map

## 2020
### Milestone 9 - 2020-10: Svg outputs
#### Changed
  - [x] Output svg on all EDA Endpoints
#### On hold
  - [ ] :sos: Rebuild all Snippets using its own svg api from t6
  - [ ] no more chart.js library as dependency
  
### Milestone 8 - 2020-10: Exploratory data analysis (EDA)
#### Added
  - [x] Filter on 1 source to get graphical and non graphical EDA results
  - [x] [Head and Tail](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Summary statistics](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Frequency shape distribution](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Boxplot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [simple Plot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Loess](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
#### On hold
  - [ ] :sos: EDA List distinct facts
  - [ ] :sos: EDA List distinct categories
  
### Milestone 7 - 2020-04: Over The Air Deployment
#### Added
  - [x] [Update Arduino source code Over The Air - using Wifi](https://api.internetcollaboratif.info/news/2020-04-11-newsletter-ota)

### Milestone 6 - 2020-03: Add Decision Rules Algorithm
#### Added
  - [x] [Algorithm linear regression for basic prediction/anomaly detection](https://api.internetcollaboratif.info/news/2020-03-10-newsletter-linearegression)

## 2019
### Milestone 5 - 2019-06: Process with a better TSdb database integration - anything but SQLite
#### Changed
  - [x] influxDb branch is live and running.
  - [x] :ballot_box_with_check: SQLite database ~~still can be activated as backup or alternative~~ [is deprecated and not maintained](https://github.com/mathcoll/t6/commit/4a6db17f26fdd1cc24413a6b67d49918149aa7fb)
  
### Milestone 4 - 2019-05: Add Security to POST datapoints payloads
#### Added
  - [x] Signature on datapoint POST
  - [x] Crypt AES 256 cbc on datapoint POST
  - [x] Flows allows to force signature and/or encryption when datapoints are POSTed

### Milestone 3 - 2019-05: Implement additional snippets
#### Added
  - [ ] :x: ~~Maps snippets, that could help for a geolocalization/geotracing~~ This feature become depredated as the #objects-maps allows to locate all objects on the map.
  - [x] Graphs snippets

## Before 2019
### Milestone 2 - 2016-04: Dashboard integration
#### Added
  - [x] Dashboards are fully integrated into the UI
  - [x] Some snippets are available to see graphs, display a simple value (like temperature), or display current date

### Milestone 1 - 2016: API completion
#### Added
  - [x] 3 resources are fully manageable via Apis
  - [x] 3 resources are remaining todo (rules, snippets and dashboards)

### Milestone 0 - 2016: API basics and simple UI to manage most of resources
#### Added
  - [x] POST, GET, PUT, DELETE on all resources
  - [x] The Api is handling and storing datapoints on each flows

### Milestone -1 - 2012-2013: First code to collect measurements from sensors
#### Added
  - [x] Collect measurement as a Proof Of Concept - not using any Api
  - [x] Store measure to SQLite Db
