# Easy-IOT
Easy IOT is an "oriented-Data" platform to connect physical Objects with timeseries DB.

## Structure & Context
### Physical World
Physical World are composed by your sensors and actuators.
Physical Objects require a virtual _Object_ in Easy-IOT and then, they could add _Data_ to _Flows_. 

### General

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/v2.0.1/status | _n/a_ | Get the status of the API |

### Objects
_Objects_ are virtual items dedicated to push data to flows.
_Objects_ are defined for each _Users_.

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/objects/ | _Bearer Auth Token_ | Get the list of _Objects_ from the current _User_. |
| GET | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer Auth Token_ | Get details on the selected _Object_. |
| POST | http://127.0.0.1:3000/v2.0.1/objects | _Bearer Auth Token_ | Add a new _Object_ to current _User_. |
| PUT | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer Auth Token_ | Update an _Object_. |
| DELETE | http://127.0.0.1:3000/v2.0.1/objects/:object_id | _Bearer Auth Token_ | Delete an _Object_. |


### Flows
_Flows_ are datastore to save time/value.
Each _Object_ can POST data to multiple _Flows_.
_Flows_ are defined for each _Users_ and are having permissions.

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/flows | _Bearer Auth Token_ | Get the list of _Flows_ from the current _User_. |
| GET | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer Auth Token_ | Get details on the selected _Flow_. |
| POST | http://127.0.0.1:3000/v2.0.1/flows | _Bearer Auth Token_ | Add a new _Flow_ and get 'rw' permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer Auth Token_ | Update a _Flow_. |
| DELETE | http://127.0.0.1:3000/v2.0.1/flows/:flow_id | _Bearer Auth K/S_ | Delete a _Flow_. |


### Data

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/data/:flow_id | _Bearer Auth Token_ | Get data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| GET | http://127.0.0.1:3000/v2.0.1/data/:flow_id/:data_id | _Bearer Auth Token_ | Get 1 specific data from a _Flows_ where the current _User_ is authorized ('rw' or 'r'). |
| POST | http://127.0.0.1:3000/v2.0.1/data/:flow_id | _Bearer Auth Token_ | Add a data to a _Flows_ (_User_ must have 'rw' permission). |


### Units

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/units | _n/a_ | Get the _Units_ list set on the Easy-IOT platform. |
| GET | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _n/a_ | Get a specific _Units_ details. |
| POST | http://127.0.0.1:3000/v2.0.1/units | _Bearer Admin_ | Add a _Unit_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _Bearer Admin_ | Update a _Unit_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/v2.0.1/units/:unit_id | _Bearer Admin_ | Delete a _Unit_ from platform, require _Admin_ permissions. |


### Datatypes

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/datatypes | _n/a_ | Get the _Datatype_ list set on the Easy-IOT platform. |
| GET | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _n/a_ | Get a specific _Datatype_ details. |
| POST | http://127.0.0.1:3000/v2.0.1/datatypes | _Bearer Admin_ | Add a _Datatype_ to platform, require _Admin_ permissions. |
| PUT | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _Bearer Admin_ | Update a _Datatype_ to platform, require _Admin_ permissions. |
| DELETE | http://127.0.0.1:3000/v2.0.1/datatypes/:datatype_id | _Bearer Admin_ | Delete a _Datatype_ from platform, require _Admin_ permissions. |


### Users and Permissions

| Verb | Endpoint | Auth | Description |
| ------------- | ------------- | ------------- | ------------- |
| GET | http://127.0.0.1:3000/v2.0.1/users | _Bearer Auth Token_ | Get the _User_ list on the Easy-IOT platform, require _Admin_ permissions. |
| GET | http://127.0.0.1:3000/v2.0.1/users/me/token | _Bearer Auth Token_ | Get self details current _User_. |
| POST | http://127.0.0.1:3000/v2.0.1/users/me/token | _Bearer Auth K/S_ | Refresh token from current _User_. |
| POST | http://127.0.0.1:3000/v2.0.1/users | _n/a_ | Add a _User_ to platform. |
| PUT | http://127.0.0.1:3000/v2.0.1/users/:user_id | _Bearer Auth Token_ | Update a _User_ to platform. |
| DELETE | http://127.0.0.1:3000/v2.0.1/users/:user_id | _Bearer Auth Token_ | Delete a _User_ from platform. |


### Security & Tokens
#### Process to handle a connection and publish data to flows:
* Create the User:

```curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-X POST http://127.0.0.1:3000/v2.0.1/users/ \
--data '{"firstName": "My FirstName", "lastName": "My LastName", "email": "myemail@domain.tld"}'```

--> Key and Secret are returned by api.



* Create the initial token (without any permission) so that we can then create a Flow:

```curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-X POST http://127.0.0.1:3000/v2.0.1/users/me/token \
--data '{"key": "LhEBfEVthAKfyqpUfbIYCtbRH.Shg.RHLSBKXapdEdQLgopnDLwmQNfYyhDXuzQZ", "secret": "uDTCbPANAPzcCyuKStJlozMuuZoiSEwbWsmzakBuUbWHjSRabMvcXsGSYxWxrxP."}'```

--> Token is returned by api.



* Create a Flow with the previous Bearer Token and permissions:

```curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Authorization: Bearer $bearer" \
-X POST http://127.0.0.1:3000/v2.0.1/flows \
--data '{"name": "My Flow Name", "unit": "String", "permission": "644", "objects": ['1', '2']}'```

--> Flow ID is returned by api.



* Create the secondary Token (with permission on the returned Flow_ID) so that we can then post data to the flow:

```curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-X POST http://127.0.0.1:3000/v2.0.1/users/me/token \
--data '{"key": "LhEBfEVthAKfyqpUfbIYCtbRH.Shg.RHLSBKXapdEdQLgopnDLwmQNfYyhDXuzQZ", "secret": "uDTCbPANAPzcCyuKStJlozMuuZoiSEwbWsmzakBuUbWHjSRabMvcXsGSYxWxrxP.", "permission":[ {"flow_id": "d05da218-2751-441d-9ed3-3458296a029e", "permission": "644"} ]}'```

--> Token2 is returned by api.



* Finally, POST data to Flow_ID with Bearer Token2, so that we have permission on that Flow_ID:

```curl -i \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Authorization: Bearer $bearer" \
-X POST http://127.0.0.1:3000/v2.0.1/data \
--data '{"flow_id":"d05da218-2751-441d-9ed3-3458296a029e", "value":"My String Value", "timestamp": "1459369102418", "publish": "true", "save": "true", "unit": "String", "mqtt_topic": ""}'```


#### Details on Tokens
##### _Bearer Auth K/S_
This Token is used to create initial Flows before having permissions.

##### _Bearer Auth Token_
Once a _Flow_ has been created you are able to authenticate using Auth Token with permissions.

##### _Bearer Admin_
This Token is only for managing _Units_ and _DataTypes_ from Admins level.
How do we set a _User_ to be admin... I'm sorry, there is no way (yet) to do so; except manually modify json database for a _User_ y adding: ```"role": "admin"```. 

##### _n/a_
Some Endpoints are open to any request, no Barear, no authentification at all.



### Mqtt rules to handle Actions
#### Rules
"Decision-Rule" engine is not yet pushed to github. But a working stable implementation is working at home since several months.
To sum up, events are pushed as json payloads to mqtt topics. Then the engine is watching for these payloads and handle them according to specific rules.

#### Actions
_Actions_ are triggered when something is happening on the Easy-IOT platform.
Actions can be: email, SMS, API calls (e.g. twitter), etc ... 


## Easy-IOT Installation
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

## Benchmark

* 20000 batch insert (cURL post queries)
* Total Duration: 70 minutes
* AVG 4.76 insertion/min
* This is a very low cpu/ram server(Celeron M 900Mhz processor)
* 100% Http Status-code 200
* TBC: at the beginning, avg insertion was higher .. this is probably due to latencies in SQLite DB
