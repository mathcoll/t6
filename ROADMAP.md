## t6 api&PWA Roadmap
### Milestone 9: Objects localization / maps
  - [ ] Add filters to #bjects-maps to customize displays
  - [ ] Add operator on t6 rule engine to update Object attribute like the latitude/longitude. This feature will make available the localization on the map

### Milestone 8: Full svg charting - no more chart.js library as dependency
  - [ ] Rebuild all Snippets using its ownsvg api from t6
  
### Milestone 7: Over The Air Deployment
  - [x] [Update Arduino source code Over The Air - using Wifi](https://api.internetcollaboratif.info/news/2020-04-11-newsletter-ota)
  
### Milestone 6: Add Decision Rules Algorithm
  - [x] [Algorithm linear regression for basic prediction/anomaly detection](https://api.internetcollaboratif.info/news/2020-03-10-newsletter-linearegression)
  
### Milestone 5: Add Security to POST datapoints payloads
  - [x] Signature on datapoint POST
  - [x] Crypt AES 256 cbc on datapoint POST
  - [x] Flows allows to force signature and/or encryption when datapoints are POSTed

### Milestone 4: Implement additional snippets
  - [x] Graphs snippets
  - [ ] ~~Maps snippets, that could help for a geolocalization/geotracing~~ Feature become depredated as the #objects-maps allows to locate all objects on the map

### Milestone 3: Process with a better TSdb database integration - anything but SQLite
  - [x] influxDb branch is live and running.
  - [x] SQLite still can be activated as backup or alternative - but is deprecated and *not maintained*

### Milestone 2: Dashboard integration
  - [x] Dashboards are fully integrated into the UI
  - [x] Some snippets are available to see graphs, display a simple value (like temperature), or display current date

### Milestone 1: API completion
  - [x] 3 resources are fully manageable via Apis
  - [x] 3 resources are remaining todo (rules, snippets and dashboards)

### Milestone 0: API basics and simple UI to manage most of resources
  - [x] POST, GET, PUT, DELETE on all resources
  - [x] The Api is handling and storing datapoints on each flows
