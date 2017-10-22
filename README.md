# t6
t6 is an "oriented-Data" platform to connect physical Objects with timeseries DB.
Please referes to CONTRIBUTING.md in case you would like to help :-)

## Structure & Context
### Physical World
Physical World are composed by your sensors and actuators.
Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.
Sample nodeMCU and Arduino scripts are available in the _pingers_ repositories.

### Application Dashboard Screenshot
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot2.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot3.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot4.png)

Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.



### General
Detailed Api documentation is available here: [api-General](https://api.internetcollaboratif.info/docs/#api-General).

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/v2.0.1/status | _n/a_ | Get the status of the API |
| GET | http://127.0.0.1:3000/v2.0.1/units | _n/a_ | Get the _Units_ list set on the t6 platform. |
| GET | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _n/a_ | Get a specific _Units_ details. |
| POST | http://127.0.0.1:3000/v2.0.1/units | _Bearer Admin_ | Add a _Unit_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _Bearer Admin_ | Update a _Unit_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _Bearer Admin_ | Delete a _Unit_ from platform, require _Admin_ permissions. |
| GET | http://127.0.0.1:3000/v2.0.1/datatypes | _n/a_ | Get the _Datatype_ list set on the t6 platform. |
| GET | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _n/a_ | Get a specific _Datatype_ details. |
| POST | http://127.0.0.1:3000/v2.0.1/datatypes | _Bearer Admin_ | Add a _Datatype_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _Bearer Admin_ | Update a _Datatype_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _Bearer Admin_ | Delete a _Datatype_ from platform, require _Admin_ permissions. |
| GET | http://127.0.0.1:3000/v2.0.1/v2.0.1/index | _n/a_ | Get the Index cards for the PWA application |

### Objects
Detailed Api documentation is available here: [api-Object](https://api.internetcollaboratif.info/docs/#api-Object).

_Objects_ are virtual items dedicated to push data to flows.
_Objects_ are defined for each _Users_.

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/objects/ | _Bearer JWT Token_ | Get the list of _Objects_ from the current _User_. |
| GET | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer JWT Token_ | Get details on the selected _Object_. |
| POST | http://127.0.0.1:3000/v2.0.1/objects | _Bearer JWT Token_ | Add a new _Object_ to current _User_. |
| PUT | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer JWT Token_ | Update an _Object_. |
| DELETE | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer JWT Token_ | Delete an _Object_. |


### Flows
Detailed Api documentation is available here: [api-Flow](https://api.internetcollaboratif.info/docs/#api-Flow).

_Flows_ are datastore to save time/value.
Each _Object_ can POST data to multiple _Flows_.
_Flows_ are defined for each _Users_ and are having permissions.

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/flows | _Bearer JWT Token_ | Get the list of _Flows_ from the current _User_. |
| GET | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer JWT Token_ | Get details on the selected _Flow_. |
| POST | http://127.0.0.1:3000/v2.0.1/flows | _Bearer JWT Token_ | Add a new _Flow_ and get 'rw' permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer JWT Token_ | Update a _Flow_. |
| DELETE | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer JWT_ | Delete a _Flow_. |


### DataPoint
Detailed Api documentation is available here: [api-DataPoint](https://api.internetcollaboratif.info/docs/#api-DataPoint).

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/data/:flow_id | _Bearer JWT Token_ | Get data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| GET | http://127.0.0.1:3000/v2.0.1/data/:flow_id/:data_id | _Bearer JWT Token_ | Get 1 specific data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| POST | http://127.0.0.1:3000/v2.0.1/data/:flow_id | _Bearer JWT Token_ | Add a data to a _Flows_ (_User_ must have 'rw' permission). |


### Dashboard
Detailed Api documentation is available here: [api-Dashboard](https://api.internetcollaboratif.info/docs/#api-Dashboard).

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/dashboards/:dashboard_id | _Bearer JWT Token_ | Get dashboards list. |


### Snippet
Detailed Api documentation is available here: [api-Snippet](https://api.internetcollaboratif.info/docs/#api-Snippet).

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/snippets/:snippet_id | _Bearer JWT Token_ | Get snippets list. |


### Users and Permissions
Detailed Api documentation is available here: [api-General](https://api.internetcollaboratif.info/docs/#).

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/authenticate | Username/Password Auth | Get JWT Token. |
| GET | http://127.0.0.1:3000/v2.0.1/users/me/token | _Bearer JWT Token_ | Get self details current _User_. |
| POST | http://127.0.0.1:3000/v2.0.1/users/me/token | _Bearer JWT Token_ | Refresh token from current _User_. |
| POST | http://127.0.0.1:3000/v2.0.1/users | _n/a_ | Add a _User_ to platform. |
| PUT | http://127.0.0.1:3000/v2.0.1/users/:user_id | _Bearer JWT Token_ | Update a _User_ to platform. |
| DELETE | http://127.0.0.1:3000/v2.0.1/users/:user_id | _Bearer JWT Token_ | Delete a _User_ from platform. |


### Security & Tokens
Detailed Api documentation is available here: [api-General](https://api.internetcollaboratif.info/docs/#).

#### Process to handle a connection and publish data to flows:
* Create the User:

```
curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-X POST http://127.0.0.1:3000/v2.0.1/authenticate/ \
--data '{"username": "<MY_USERNAME>", "password": "<MY_PASSWORD>"}'
```

--> JWT Token is returned by api.


* Create a Flow with the previous JWT Token and permissions:

```
curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-X POST http://127.0.0.1:3000/v2.0.1/flows \
--data '{"name": "My Flow Name", "unit": "String", "permission": "644", "objects": ['1', '2']}'
```

--> FLOW_ID is returned by api.




* Then, POST data to Flow_ID using <JWT_TOKEN>:

```
curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-X POST http://127.0.0.1:3000/v2.0.1/data \
--data '{"flow_id":"<FLOW_ID>", "value":"My String Value", "timestamp": "1459369102418", "publish": "true", "save": "true", "unit": "String", "mqtt_topic": ""}'
```

### Mqtt rules to handle Actions
#### Rules
"Decision-Rule" engine is not yet pushed to github. But a working stable implementation is working at home since several months.
To sum up, events are pushed as json payloads to mqtt topics. Then the engine is watching for these payloads and handle them according to specific rules.

#### Actions
_Actions_ are triggered when something is happening on the t6 platform.
Actions can be: email, SMS, API calls (e.g. twitter), etc ... 


## t6 Installation
```
Install node (if needed): https://nodejs.org/en/
Install npm (if needed): https://github.com/npm/npm
_Do not use sudo/root to install t6, this is not necessary_
git clone https://github.com/mathcoll/t6.git ./t6 & cd ./t6
npm install
rename "settings-hostname.js" according to your server _hostname_ and edit the file.
rename "rules-hostname.js" according to your server _hostname_.
rename "sensors-hostname.js" according to your server _hostname_.
rename "db-hostname.json" according to your server _hostname_.
```
On linux, to identify your hostname, you can rune the following command:
```
hostname
```

Please have a look at the options in _settings-hostname.js_, there are some secrets to be customized.

Once the setting are done, you can initialize the influxDb databases:
```
CREATE DATABASE "t6"
CREATE DATABASE "requests" WITH DURATION 7d REPLICATION 1 SHARD DURATION 1d NAME "req"
CREATE RETENTION POLICY "quota7d" on "t6" DURATION 7d REPLICATION 1 SHARD DURATION 1d
```

You can add the server running as a service, tested with Ubuntu and Debian:
* First: install the server in services:
```
sudo ln -s /var/www/t6/etc/init.d/t6 /etc/init.d/t6
```

And then, start _t6_ using:
```
sudo /etc/init.d/t6 (re)start|stop|status
```

* Then set the server to run at start: 
```
sudo update-rc.d t6 defaults
```

## t6 Troobleshooting after installation
Q: ```sudo /etc/init.d/t6 start``` does not return any output, what should I do?

A: Try to set chmod +x to file /var/www/t6/bin/www


Q: Do I need to install sqlite3?

A: sqlite3 is not required and can be disabled in the settings. sqlite3 lbrary to store data is not maintained and become obsolete.


Q: I got an error trying to install sqlite3, what should I do?

A: Ubuntu and Debian usually have a dedicated nodejs version, try removing "node" and install ```sudo apt-get install nodejs-legacy``` instead, then ```sudo npm install sqlite3@3.0.5```.
