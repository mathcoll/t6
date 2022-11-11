"use strict";
var t6websockets = module.exports = {};

t6websockets.init = async function() {
	t6console.log("");
	t6console.log("===========================================================");
	t6console.log("==================== Init Web Sockets... ==================");
	t6console.log("===========================================================");
	global.wsClients = new Map();
	global.wss = new WebSocketServer({
		port: socketsPort,
		perMessageDeflate: {
			zlibDeflateOptions: {
				// See zlib defaults.
				chunkSize: 1024,
				memLevel: 7,
				level: 3
			},
			zlibInflateOptions: {
				chunkSize: 10 * 1024
			},
			// Other options settable:
			clientNoContextTakeover: true, // Defaults to negotiated value.
			serverNoContextTakeover: true, // Defaults to negotiated value.
			serverMaxWindowBits: 10, // Defaults to negotiated value.
			// Below options specified as default values.
			concurrencyLimit: 10, // Limits zlib concurrency for perf.
			threshold: 1024 // Size (in bytes) below which messages
			// should not be compressed if context takeover is disabled.
		},
		verifyClient: (info, callback) => {
			t6console.debug("verifyClient headers", info.req.headers);
			t6console.debug("verifyClient url", info.req.url);
			let authHeader;
			let basic_token;
			let credentials;
			try {
				authHeader = info.req.headers.authorization;
				basic_token = url.parse(info.req.url, true).query.BASIC_TOKEN;
				t6console.debug(`authHeader: ${authHeader}`);
				t6console.debug(`basic_token: ${basic_token}`);
			} catch (error) {
				info.req.user_id = null;
				t6console.debug("verifyClient error", error);
				callback(false, 203 ,"Non-Authoritative Information");
				return;
			}
			if (typeof authHeader!=="undefined" && authHeader?.split(" ")) {
				credentials = atob(authHeader.split(" ")[1])?.split(":");
			} else if(typeof basic_token!=="undefined") {
				credentials = basic_token?.split(":");
			} else {
				callback(false, 401 ,"Non-Authoritative Information");
			}
			if ( typeof credentials!=="undefined" ) {
				let key = credentials[0];
				let secret = credentials[1];
				let queryT = {
				"$and": [
							{ "key": key },
							{ "secret": secret },
						]
				};
				let u = access_tokens.findOne(queryT);
				if ( u && typeof u.user_id !== "undefined" ) {
					let user = users.findOne({id: u.user_id});
					if (user.id) {
						t6console.debug("verifyClient headers OK", u.user_id);
						info.req.user_id = u.user_id;
						callback(true, 200, "OK");
						t6events.addAudit("t6App", "Socket_authenticate key:secret", u.user_id, info.req.headers["sec-websocket-key"], {"status": 200});
					} else {
						info.req.user_id = null;
						callback(false, 401, "Not Authorized");
						t6events.addAudit("t6App", "Socket_authenticate key:secret", "anonymous", info.req.headers["sec-websocket-key"], {"status": 401, "error_id": 444403});
					}
				} else {
					t6console.debug("verifyClient headers NOK1");
					info.req.user_id = null;
					callback(false, 401, "Not Authorized");
					t6events.addAudit("t6App", "Socket_authenticate key:secret", "anonymous", info.req.headers["sec-websocket-key"], {"status": 401, "error_id": 444402});
				}
			}
		}
	});
	wss.on("connection", (ws, req) => {
		let id = uuid.v4();
		wsClients.set(ws, { id: id, user_id: req.user_id, "channels": [], webSocket: {"ua": req.headers["user-agent"], key: req.headers["sec-websocket-key"]} });
		t6console.debug(`Welcoming socket_id: ${id}`);
		ws.send(JSON.stringify({"arduinoCommand": "info", "message": `Welcome socket_id: ${id}`}));
		ws.send(JSON.stringify({"arduinoCommand": "claimRequest", "socket_id": id}));
		t6events.addStat("t6App", "Socket welcoming", req.user_id, id, {"status": 200});
		t6mqtt.publish(null, `${mqttSockets}/${id}`, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Socket welcome", "environment": process.env.NODE_ENV}), false);
	
		ws.on("close", () => {
			let metadata = wsClients.get(ws);
			let i = t6ConnectedObjects.indexOf(metadata.object_id);
			if (i > -1) {
				t6ConnectedObjects.splice(i, 1);
				t6console.debug(`Object Status Changed: ${metadata.object_id} is hidden`);
			}
			t6console.debug(`Closing ${metadata.id}`);
			wsClients.delete(ws);
			t6events.addStat("t6App", "Socket closing", req.user_id, metadata.id, {"status": 200});
			t6mqtt.publish(null, `${mqttSockets}/${metadata.id}`, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Socket close", "environment": process.env.NODE_ENV}), false);
		});
		ws.on("message", (message) => {
			let metadata = wsClients.get(ws);
			t6events.addStat("t6App", "Socket messaging", req.user_id, metadata.id, {"status": 200});
			t6mqtt.publish(null, `${mqttSockets}/${metadata.id}`, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": "Socket message", "environment": process.env.NODE_ENV}), false);
			message = getJson( message.toString("utf-8") );
	
			if (typeof message === "object") {
				t6console.debug(`Received command "${message.command}" from socket_id: ${metadata.id}`);
				switch(message.command) {
					case "subscribe":
						metadata = wsClients.get(ws);
						(metadata.channels).indexOf(message.channel) === -1?(metadata.channels).push(message.channel):t6console.log("Already subscribed to channel");
						ws.send(JSON.stringify({"arduinoCommand": "info", "channels": metadata.channels}));
						wsClients.set(ws, metadata);
						break;
					case "unsubscribe":
						metadata = wsClients.get(ws);
						(metadata.channels) = (metadata.channels).filter((chan) => chan !== message.channel);
						ws.send(JSON.stringify({"arduinoCommand": "info", "channels": metadata.channels}));
						wsClients.set(ws, metadata);
						break;
					case "getSubscription":
						metadata = wsClients.get(ws);
						if(typeof metadata.channels!=="undefined") {
							ws.send(JSON.stringify({"arduinoCommand": "info", "channels": metadata.channels}));
						} else {
							ws.send(JSON.stringify({"arduinoCommand": "info", "channels": undefined}));
						}
						break;
					case "unicast":
						if(typeof message.object_id!=="undefined" && message.object_id!==null) {
							wss.clients.forEach(function each(client) {
								let current = wsClients.get(client);
								if(current.object_id === message.object_id) {
									client.send(JSON.stringify(message.payload));
									ws.send(`Unicasted to object_id: ${current.object_id}`);
								}
							});
						} else {
							ws.send("NOK");
						}
						break;
					case "broadcast":
						// Broadcast only to the same user as the claimed object
						wss.clients.forEach(function each(client) {
							let current = wsClients.get(client);
							if(current.user_id === req.user_id) {
								client.send(JSON.stringify(message.payload));
								ws.send(`Broadcasted (filtered on user_id ${req.user_id}) to object_id: ${current.object_id}`);
							}
						});
						ws.send("OK");
						break;
					case "multicast":
						// Multicasted only to the same user as the claimed object and to the Objects that subscribed to the specified channel
						wss.clients.forEach(function each(client) {
							let current = wsClients.get(client);
							if(current.user_id === req.user_id && (current.channels).indexOf(message.channel) > -1 ) {
								client.send(JSON.stringify(message.payload));
								ws.send(`Multicasted (filtered on user_id ${req.user_id}) and channel "${message.channel}" to object_id: ${current.object_id}`);
							}
						});
						ws.send("OK");
						break;
					case "claimUI":
						if( message.ui_id ) {
							t6console.debug("No signature check - Claim auto-accepted");
							metadata = wsClients.get(ws);
							metadata.ui_id = message.ui_id;
							wsClients.set(ws, metadata);
							ws.send(JSON.stringify({"arduinoCommand": "claimed", "status": "OK Accepted", "ui_id": metadata.ui_id, "socket_id": metadata.id}));
							t6mqtt.publish(null, mqttSockets+"/"+metadata.id, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": `Socket Claim accepted ui_id ${metadata.ui_id}`, "environment": process.env.NODE_ENV}), false);
							t6ConnectedObjects.push(metadata.ui_id);
							t6console.debug(`Object/UI Status Changed: ${metadata.ui_id} is visible`);
						}
						break;
					case "claimObject":
						let query = { "$and": [ { "user_id" : req.user_id }, { "id" : message.object_id }, ] };
						//t6console.debug("Searching for Objects: ", query["$and"][0]);
						//t6console.debug("Searching for Objects: ", query["$and"][1]);
						let object = objects.findOne(query);
						if( message.object_id && object && typeof object.secret_key!=="undefined" && object.secret_key!==null  && object.secret_key!=="" ) {
							t6console.debug("Found key from Object", message.object_id);
							//t6console.debug("Verifying signature", message.signature);
							jsonwebtoken.verify(String(message.signature), object.secret_key, (error, unsignedObject_id) => {
								if(!error && unsignedObject_id && unsignedObject_id.object_id===message.object_id) {
									//t6console.debug(object);
									t6console.debug("Signature is valid - Claim accepted");
									metadata = wsClients.get(ws);
									metadata.object_id = message.object_id;
									wsClients.set(ws, metadata);
									ws.send(JSON.stringify({"arduinoCommand": "claimed", "status": "OK Accepted", "object_id": metadata.object_id, "socket_id": metadata.id}));
									t6mqtt.publish(null, mqttSockets+"/"+metadata.id, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": `Socket Claim accepted object_id ${metadata.object_id}`, "environment": process.env.NODE_ENV}), false);
									t6ConnectedObjects.push(metadata.object_id);
									t6console.debug(`Object Status Changed: ${metadata.object_id} is visible`);
								} else {
									t6console.debug("Error", error);
									t6console.debug("unsignedObject_id", unsignedObject_id.object_id);
									t6console.debug("message.object_id", message.object_id);
									t6console.debug("Signature is invalid - Claim rejected");
									ws.send(JSON.stringify({"arduinoCommand": "claimed", "status": "Not Authorized, invalid signature", "object_id": null, "socket_id": metadata.id}));
									t6mqtt.publish(null, mqttSockets+"/"+metadata.id, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": `Socket Claim rejected object_id ${metadata.object_id}`, "environment": process.env.NODE_ENV}), false);
								}
							});
						} else {
							t6console.debug("No Secret Key available on Object or Object is not yours or Object does not have a valid signature key.");
							ws.send(JSON.stringify({"arduinoCommand": "claimed", "status": "Not Authorized, invalid signature", "object_id": null, "socket_id": metadata.id}));
							t6mqtt.publish(null, mqttSockets+"/"+metadata.id, JSON.stringify({date: moment().format("LLL"), "dtepoch": parseInt(moment().format("x"), 10), "message": `Socket Claim rejected object_id ${metadata.object_id}`, "environment": process.env.NODE_ENV}), false);
						}
						break;
					case "getUA":
						metadata = wsClients.get(ws);
						if(typeof metadata.webSocket.ua!=="undefined") {
							ws.send(metadata.webSocket.ua);
						} else {
							ws.send("undefined");
						}
						break;
					case "getKey":
						metadata = wsClients.get(ws);
						ws.send(metadata.webSocket.key);
						break;
					case "getObject":
						metadata = wsClients.get(ws);
						if(typeof metadata.object_id!=="undefined") {
							ws.send(metadata.object_id);
						} else {
							ws.send("undefined");
						}
						break;
					case "getUser":
						metadata = wsClients.get(ws);
						if(typeof metadata.user_id!=="undefined") {
							ws.send(metadata.user_id);
						} else {
							ws.send("undefined");
						}
						break;
					case "help":
						ws.send(`Hello ${metadata.id}, welcome to t6 IoT sockets command interface.`);
						ws.send("Here are the commands :");
						ws.send("- broadcast: to cast a message to any connected Object from your user account.");
						ws.send("- multicast: to cast a message to both connected Object to the same user as the claimed object, and to the Objects that subscribed to the specified channel.");
						ws.send("- unicast: to cast a message to a specif Object you own.");
						ws.send("- claimObject: to Claim the id of a specific Object.");
						ws.send("- claimUi: to Claim the id of current UI.");
						ws.send("- getObject: to get the id of an Object claimed to server.");
						ws.send("- getUser: to get the user_id of an Object claimed to server.");
						ws.send("- getUA: to get the user-agent of an Object.");
						break;
					default:
						break;
				}
			} else {
				t6console.debug(`Received message ${message} from socket_id ${metadata.id}`);
			}
		});
	});
	wss.on("upgrade", (request, socket, head) => {
		authenticate(request, function next(err, client) {
			t6console.debug(err);
			t6console.debug(client);
			if (err || !client) {
				socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
				socket.destroy();
				return;
			}
			wss.handleUpgrade(request, socket, head, function done(ws) {
				wss.emit("connection", ws, request, client);
			});
		});
	});
	wss.onerror = () => {
		t6console.error(`${appName} wsError.`);
	};
	t6console.log(`${appName} ws(s) listening to ${socketsScheme}${socketsHost}:${socketsPort}.`);
};

module.exports = t6websockets;