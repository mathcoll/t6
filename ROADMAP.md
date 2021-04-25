## t6 Api&PWA Roadmap
### Milestone 11: Sensor-Fusion
  - [ ] Add processor to telegraf to customize fusion
  - [x] Dispatch write datapoints to telegraf instead of influxDB
  - [x] Instantiate a telegraf server
  - [x] Create separate branch for sensor-Fusion

### Milestone 10: Objects localization / maps
  - [ ] Add filters to #objects-maps to customize displays
  - [ ] Add an operator on t6 rule engine to update Object attribute like the latitude/longitude. This feature will make available the localization on the map
  - [x] Add a dedicated page (#objects-maps) to locate objects on a map

### Milestone 9: Full svg charting - no more chart.js library as dependency
  - [ ] Rebuild all Snippets using its own svg api from t6
  
### Milestone 8: Exploratory data analysis (EDA)
  - [ ] Distinct facts
  - [ ] Distinct categories
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
  - [x] SQLite ~~still can be activated as backup or alternative~~ [is deprecated and not maintained](https://github.com/mathcoll/t6/commit/4a6db17f26fdd1cc24413a6b67d49918149aa7fb)
  
### Milestone 4 - May 2019: Add Security to POST datapoints payloads
  - [x] Signature on datapoint POST
  - [x] Crypt AES 256 cbc on datapoint POST
  - [x] Flows allows to force signature and/or encryption when datapoints are POSTed

### Milestone 3: Implement additional snippets
  - [ ] ~~Maps snippets, that could help for a geolocalization/geotracing~~ This feature become depredated as the #objects-maps allows to locate all objects on the map.
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
