# t6
t6 is an "oriented-Data" platform to connect physical Objects with timeseries DB.
Please referes to CONTRIBUTING.md in case you would like to help :-)

## Structure & Context
### Physical World
Physical World are composed by your sensors and actuators.
Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.
Sample nodeMCU and Arduino scripts are available in the _sensors_ repositories.

### Application & Dashboard Screenshots
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot2.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot3.png)
![t6 screenshot](https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-screenshot4.png)

Physical Objects require a virtual _Object_ in t6 and then, they could add _Data_ to _Flows_.

### t6 API first: Live, eat, and breathe the API-first lifestyle of t6
Detailed Api documentation is available here: [api-General](https://api.internetcollaboratif.info/docs/).

### Mqtt rules to handle Actions
#### Rules
"Decision-Rule" engine is not yet pushed to github. But a working stable implementation is working at home since several months.
To sum up, events are pushed as json payloads to mqtt topics. Then the engine is watching for these payloads and handle them according to specific rules.
#### Actions
_Actions_ are triggered when something is happening on the t6 platform.
Actions can be: email, SMS, API calls (e.g. twitter), etc ... 

## t6 Installation
```
Install node (if needed): https://nodejs.org/en/
Install npm (if needed): https://github.com/npm/npm
```

_Do not use sudo/root to install t6, this is not necessary_ and not recommended
```
git clone https://github.com/mathcoll/t6.git ./t6 & cd ./t6
npm install
rename "settings-hostname.js" according to your server _hostname_ and edit the file.
rename "rules-hostname.js" according to your server _hostname_.
rename "sensors-hostname.js" according to your server _hostname_.
rename "db-hostname.json" according to your server _hostname_.
```
:sparkles: On linux, to identify your hostname, you can run the following command:
```console
$ hostname
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
```console
$ sudo ln -s /var/www/t6/etc/init.d/t6 /etc/init.d/t6
```

And then, start _t6_ using:
```console
$ sudo /etc/init.d/t6 (re)start|stop|status
```

  * Then, set the server to run at start: 
```console
$ sudo update-rc.d t6 defaults
```

## t6 Troobleshooting after installation
Q: ```sudo /etc/init.d/t6 start``` does not return any output, what should I do?

A: Try to set chmod +x to file /var/www/t6/bin/www

Q: Do I need to install sqlite3?

A: sqlite3 is not required and can be disabled in the settings. sqlite3 library to store data is not maintained and become obsolete.

Q: I got an error trying to install sqlite3, what should I do?

A: Ubuntu and Debian usually have a dedicated nodejs version, try removing "node" and install ```sudo apt-get install nodejs-legacy``` instead, then ```sudo npm install sqlite3@3.0.5```.
