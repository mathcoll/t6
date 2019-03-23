# t6
t6 is an "oriented-Data" platform to connect physical Objects with timeseries DB.
Please referes to CONTRIBUTING.md in case you would like to help :-)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3d45972dd53246f58ba82a6f75483116)](https://www.codacy.com/app/internetcollaboratif/t6?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mathcoll/t6&amp;utm_campaign=Badge_Grade)

## Roadmap
===========================
### Milestone 5: Add Security to POST datapoints payloads
- [x] Add signature
- [ ] Add crypt AES 256 cbc

### Milestone 4: Implement additional snippets
- [x] Graphs snippets.
- [ ] Maps snippets, that could help for a geolocalization/geotracing.

### Milestone 3: Process with a better TSdb database integration - anything but SQLite
- [x] influxDb branch is live and running.
- [x] SQLite still can be activated as backup or alternative - but is deprecated and *not maintained*.

### Milestone 2: Dashboard integration
- [x] Dashboards are fully integrated into the UI.
- [x] Some snippets are available to see graphs, display a simple value (like temperature), or display current date.

### Milestone 1: API completion
- [x] 3 resources are fully manageable via Apis.
- [ ] 3 resources  are remaining todo (rules, snippets and dashboards)

### Milestone 0: API basics and simple UI to manage most of resources
- [x] 