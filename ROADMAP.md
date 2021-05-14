## t6 Api&PWA Roadmap

:sos: : please refers to [CONTRIBUTING.md](../blob/master/CONTRIBUTING.md) in case you would like to help :-)
[x] : Task completed
:ballot_box_with_check: : Task completed but no longer activated today - deprecated
[ ] : Task not started or even not completed

### Milestone 12 - May 2021: InfluxData Cloud secondary storage (as an option)
  - [ ] Use only one library (instead of 2!) to write datapoints to both timeseries InfluxDb and InfluxData Cloud
  - [x] UI modifications to edit InfluxData Cloud token information
  - [x] Customize Payload to allow storing datapoint on InfluxData Cloud
  - [x] Customize Flows to allow storing datapoint on InfluxData Cloud

### Milestone 11 - April 2021: Sensor-Data-Fusion
  - [ ] ~~Add processor to telegraf to customize fusion~~
  - [x] Implement internal Preprocessor to Validate, Sanitize, Convert and/or Transform input payload values
  - [x] Dispatch write datapoints to telegraf instead of influxDB
  - [x] Instantiate a telegraf server
  - [x] Create separate branch for sensor-Fusion

### Milestone 10 - February 2021: Objects localization / maps
  - [ ] :sos: Add filters to #objects-maps to customize displays
  - [ ] :sos: Add an operator on t6 rule engine to update Object attribute like the latitude/longitude. This feature will make available the localization on the map
  - [x] Add a dedicated page (#objects-maps) to locate objects on a map

### Milestone 9 - October 2020: Full svg charting ; no more chart.js library as dependency
  - [ ] :sos: Rebuild all Snippets using its own svg api from t6
  
### Milestone 8 - October 2020: Exploratory data analysis (EDA)
  - [ ] :sos: EDA List distinct facts
  - [ ] :sos: EDA List distinct categories
  - [x] Filter on 1 source to get graphical and non graphical EDA results
  - [x] [Head and Tail](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Summary statistics](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Frequency shape distribution](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Boxplot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [simple Plot](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  - [x] [Loess](https://api.internetcollaboratif.info/news/2020-10-19-newsletter-data-exploration)
  
### Milestone 7 - April 2020: Over The Air Deployment
  - [x] [Update Arduino source code Over The Air - using Wifi](https://api.internetcollaboratif.info/news/2020-04-11-newsletter-ota)

### Milestone 6 - March 2020: Add Decision Rules Algorithm
  - [x] [Algorithm linear regression for basic prediction/anomaly detection](https://api.internetcollaboratif.info/news/2020-03-10-newsletter-linearegression)

### Milestone 5 - June 2019: Process with a better TSdb database integration - anything but SQLite
  - [x] influxDb branch is live and running.
  - [x] :ballot_box_with_check: SQLite ~~still can be activated as backup or alternative~~ [is deprecated and not maintained](https://github.com/mathcoll/t6/commit/4a6db17f26fdd1cc24413a6b67d49918149aa7fb)
  
### Milestone 4 - May 2019: Add Security to POST datapoints payloads
  - [x] Signature on datapoint POST
  - [x] Crypt AES 256 cbc on datapoint POST
  - [x] Flows allows to force signature and/or encryption when datapoints are POSTed

### Milestone 3: Implement additional snippets
  - [ ] :x: ~~Maps snippets, that could help for a geolocalization/geotracing~~ This feature become depredated as the #objects-maps allows to locate all objects on the map.
  - [x] Graphs snippets

### Milestone 2 - April 2016: Dashboard integration
  - [x] Dashboards are fully integrated into the UI
  - [x] Some snippets are available to see graphs, display a simple value (like temperature), or display current date

### Milestone 1 - 2016: API completion
  - [x] 3 resources are fully manageable via Apis
  - [x] 3 resources are remaining todo (rules, snippets and dashboards)

### Milestone 0 - 2016: API basics and simple UI to manage most of resources
  - [x] POST, GET, PUT, DELETE on all resources
  - [x] The Api is handling and storing datapoints on each flows

### Milestone -1 - back in 2012-2013: First code to collect measurements from sensors
  - [x] Collect measurement - not using any Api
  - [x] Store measure to SQLite Db
