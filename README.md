# Easy-IOT
Easy IOT is an "oriented-Data" platform to connect physical Objects with timeseries DB.

# Structure & Context
## Physical World
Physical World are composed by your sensors and actuators.
Physical Objects require a virtual _Object_ in Easy-IOT and then, they could add _Data_ to _Flows_. 


## Objects
_Objects_ are virtual items dedicated to push data to flows.
_Objects_ are defined for each _Users_.

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/objects/ | _Bearer_ | Get the list of _Objects_ from the current _User_. |
| GET | http://127.0.0.1:3000/objects/:object_id | _Bearer_ | Get details on the selected _Object_. |
| POST | http://127.0.0.1:3000/objects | _Bearer_ | Add a new _Object_ to current _User_. |
| PUT | http://127.0.0.1:3000/objects/:object_id | _Bearer_ | Update an _Object_. |
| DELETE | http://127.0.0.1:3000/objects/:object_id | _Bearer_ | Delete an _Object_. |


## Flows
_Flows_ are datastore to save time/value.
Each _Object_ can POST data to multiple _Flows_.
_Flows_ are defined for each _Users_ and are having permissions.

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/flows | _Bearer_ | Get the list of _Flows_ from the current _User_. |
| GET | http://127.0.0.1:3000/flows/:flow_id | _Bearer_ | Get details on the selected _Flow_. |
| POST | http://127.0.0.1:3000/flows | _Bearer_ | Add a new _Flow_ and get 'rw' permissions. |
| PUT | http://127.0.0.1:3000/flows/:flow_id | _Bearer_ | Update a _Flow_. |
| DELETE | http://127.0.0.1:3000/flows/:flow_id | _Bearer_ | Delete a _Flow_. |


## Data

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/data/:flow_id | _Bearer_ | Get data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| GET | http://127.0.0.1:3000/data/:flow_id/:data_id | _Bearer_ | Get 1 specific data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| POST | http://127.0.0.1:3000/data/:flow_id | _Bearer_ | Add a data to a _Flows_ (_User_ must have 'rw' permission). |


## Units

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/units | _n/a_ | Get the _Units_ list set on the Easy-IOT platform. |
| GET | http://127.0.0.1:3000/units/:unit_id | _n/a_ | Get a specific _Units_ details. |
| POST | http://127.0.0.1:3000/units | _Bearer_ | Add a _Unit_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/units/:unit_id | _Bearer_ | Update a _Unit_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/units/:unit_id | _Bearer_ | Delete a _Unit_ from platform, require _Admin_ permissions. |


## Datatypes

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/datatypes | _n/a_ | Get the _Datatype_ list set on the Easy-IOT platform. |
| GET | http://127.0.0.1:3000/datatypes/:datatype_id | _n/a_ | Get a specific _Datatype_ details. |
| POST | http://127.0.0.1:3000/datatypes | _Bearer_ | Add a _Datatype_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/datatypes/:datatype_id | _Bearer_ | Update a _Datatype_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/datatypes/:datatype_id | _Bearer_ | Delete a _Datatype_ from platform, require _Admin_ permissions. |


## Users and Permissions

| Verb | Uri | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/users | _Bearer_ | Get the _User_ list on the Easy-IOT platform, require _Admin_ permissions. |
| GET | http://127.0.0.1:3000/users/me | _Bearer_ | Get self details current _User_). |
| GET | http://127.0.0.1:3000/users/me/permissions | _Bearer_ | Get list of current _User_'s permissions on flows. |
| POST | http://127.0.0.1:3000/users/me/token | API_KEY+API_SECRET | Refresh token from current _User_. |
| POST | http://127.0.0.1:3000/users | _Bearer_ | Add a _User_ to platform. |
| PUT | http://127.0.0.1:3000/users/:user_id | _Bearer_ | Update a _User_ to platform. |
| DELETE | http://127.0.0.1:3000/users/:user_id | _Bearer_ | Delete a _User_ from platform. |


## Security
* Make an HTTP POST request to a endpoint (http://127.0.0.1:3000/users/me/token) which validates the user’s API key pair
* API generates a temporary access token that will expire in 1 hour


* Admin
* 'r' on flows
* 'rw' on flows


## Mqtt rules to handle Actions
### Rules
"Decision-Rule" engine is not yet pushed to github. But a working stable implementation is working at home since several months.
To sum up, events are pushed as json payloads to mqtt topics. Then the engine is watching for these payloads and handle them according to specific rules.

### Actions
_Actions_ are triggered when something is happening on the Easy-IOT platform.
Actions can be: email, SMS, API calls (e.g. twitter), etc ... 


# Easy-IOT Installation
```
git clone https://github.com/mathcoll/Easy-IOT.git ./Easy-IOT & cd Easy-IOT
npm install
```

You can add the server running as a service, tested with Ubuntu and Debian:
* First: install the server in services:
```
sudo ln -s /var/www/EasyIOT/etc/init.d/EasyIOT /etc/init.d/Easy-IOT
```

* Then set the server to run at start: 
```
sudo update-rc.d Easy-IOT defaults
```

# Benchmark

* 20000 batch insert (cURL post queries)
* Total Duration: 70 minutes
* AVG 4.76 insertion/min
* This is a very low cpu/ram server(Celeron M 900Mhz processor)
* 100% Http Status-code 200
* TBC: at the beginning, avg inertion was higher .. this is probably due to latencies in SQLite DB
