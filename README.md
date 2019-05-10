<img src="https://github.com/mathcoll/t6/blob/master/public/img/t6.png" alt="t6 logo" title="t6 logo" align="left" height="96" width="96"/>

# t6 - Connect real world Object to Digital Api
t6 is an "oriented-Data" platform to connect physical Objects with timeseries DB.
Please referes to CONTRIBUTING.md in case you would like to help :-)

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/3d45972dd53246f58ba82a6f75483116)](https://www.codacy.com/app/internetcollaboratif/t6?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mathcoll/t6&amp;utm_campaign=Badge_Grade)

## Structure & Context
### Physical World
Physical World are composed by your sensors and actuators.
Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.
Sample nodeMCU and Arduino scripts are available in the _sensors_ repositories.

### Application & Dashboard Screenshots
| Home page | Object Add form |
| --------- | --------------- |
| ![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot.png "Home page")  | ![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot4.png "Object Add form")  |

| Objects list | Dashboard view |
| ------------ | -------------- |
| ![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot2.png "Objects list")  | ![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot3.png "Dashboard view")  |

Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.

### t6 API first: Live, eat, and breathe the API-first lifestyle of t6
Detailed Api documentation is available here: [api-General](https://api.internetcollaboratif.info/docs/).

### Mqtt rules to handle Actions
#### Rules
"Decision-Rule" engine is an event based trigger. The engine is watching for fact matching conditions on payloads coming from datapoint POST, and handle action  according to rules.
_Actions_ are triggered when something is happening on the t6 platform.

Conditions matching operators:
* isDayTime
* anormalityChange: _TODO_
* diffFromPrevious: _TODO_
* All logical Math operators listed and documented: https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#operators

Available Actions:
* mqttPublish
* mqttCommand
* email
* httpWebhook
* serial
* sms: _TODO_
* Ifttt: _TODO_
* slackMessage: _TODO_
* .../...

## t6 security policy
t6 implement various level of security:
* __JWT and signed token__ (Token lifetime can be setup in configuration file, but suggested to be short);
* POSTing to timeseries endpoints allows __signed payloads__ (with a shared secret) to check and verify sender;
* POSTing to timeseries endpoints allows __encrypted payloads__ (aes-256-cbc only yet; with a shared secret, no public key yet);
* POSTing to timeseries allows both __signed then encrypted payloads__;
* Optionally, __signature and/or encryption can be required__ from a _Flow_;
* Rule based events can send data to __Mqtt using encryption__;
* User __passwords are bcrypt-hashed__ in databased; at least not in clear;
* User __passwords recovery__ process is secured, but still can be improved when the User set it's own password and Post data;

## t6 Installation
```console
Install node (if needed): https://nodejs.org/en/
Install npm (if needed): https://github.com/npm/npm
```

_Do not use sudo/root to install t6, this is not necessary_ and not recommended.
```console
$ git clone https://github.com/mathcoll/t6.git ./t6 & cd ./t6
$ npm install
$ rename "settings-hostname.js" according to your server _hostname_ and edit the file.
$ rename "rules-hostname.js" according to your server _hostname_.
$ rename "sensors-hostname.js" according to your server _hostname_.
$ rename "db-hostname.json" according to your server _hostname_.
```
:sparkles: On linux, to identify your hostname, you can run the following command:
```console
$ hostname
```

Please have a look at the options in _settings-hostname.js_, there are some secrets to be customized.


## t6 as a startup service (Linux)
You can add the server running as a service, tested with Ubuntu and Debian:
* First: install the server as service:
```console
$ sudo ln -s /var/www/t6/etc/init.d/t6 /etc/init.d/t6
```
* And then, start _t6_ using:
```console
$ sudo /etc/init.d/t6 (re)start|stop|status
```

* Finally, set the service to run at startup: 
```console
$ sudo update-rc.d t6 defaults
```

## t6 timeseries settings
Once the setting are done, you can initialize the influxDb databases:
```console
CREATE DATABASE "t6"
```
Database will contains the following measurements:
* _data_: All timeseries for measures; 
* _events_: events happening in t6 Api; not really used, except for few logs;
* _requests_: Allows to manage quotas and limits;


## t6 Troobleshooting after installation
Q: ```sudo /etc/init.d/t6 start``` does not return any output, what should I do?

A: Try to set chmod +x to file /var/www/t6/bin/www

Q: Do I need to install sqlite3?

A: sqlite3 is not required and can be disabled in the settings. sqlite3 library to store data is not maintained and become obsolete. You should avoid activating sqlite3.

Q: I got an error trying to install sqlite3, what should I do?

A: Ubuntu and Debian usually have a dedicated nodejs version, try removing "node" and install ```sudo apt-get install nodejs-legacy``` instead, then ```sudo npm install sqlite3@3.0.5```.
