require("settings")
dofile("wifi.lua")
dofile("webserver.lua")
DHT=require("dht11")
DHT.init(DHT_PIN)

function readDHT11()
    DHT=require("dht11")
    DHT.init(DHT_PIN)
    Temperature = DHT.getTemperature()
    Humidity = DHT.getHumidity()
    --print("-----> Temperature"..Temperature.."; ".."Humidity:"..Humidity)
    DHT = nil
    package.loaded["dht11"]=nil
end

function pushData()
    readDHT11()
    sendToServer('{ "flow_id": "6d844fbf-29c0-4a41-8c6a-0e9f3336cea3", "value": "'..Temperature..'", "unit": "°C", "mqtt_topic": "couleurs/nodeMCU/temperature", "publish": "true", "save": "true", "timestamp": "" }')
    sendToServer('{ "flow_id": "19fc7ca5-a4f1-4af3-91c9-2426bd1a3f0f", "value": "'..Humidity..'", "unit": "percentage", "mqtt_topic": "couleurs/nodeMCU/humidity", "publish": "true", "save": "true", "timestamp": "" }')
    DHT = nil
    package.loaded["dht11"]=nil
end

function sendToServer(data)
    print("Posting data to "..easyiotHOST..":"..easyiotPORT)
    
    connEI=net.createConnection(net.TCP, 0)
    connEI:connect(easyiotPORT, easyiotIP) 
    connEI:on("connection", function(connEI, c)
        connEI:send("POST /v2.0.1/data HTTP/1.1\r\n")
        connEI:send("Host: "..easyiotIP.."\r\n")
        connEI:send("Authorization: Bearer "..bearer.."\r\n")
        connEI:send("Accept: application/json\r\n")
        connEI:send("Content-Type: application/json\r\n")
        connEI:send("Content-Length: "..string.len(data).."\r\n")
        connEI:send("\r\n")
        connEI:send(data)
    end)
    
    connEI:on("receive", function(connEI, payload)
        if (string.find(payload, "200 OK") ~= nil) then
            print("Posted OK")
        else
            print("Posted NOK!")
        end
    end)
    
    connEI:on("sent",function(connEI)
      print("Closing connection")
      connEI:close()
    end)
    
    connEI:on("disconnection", function(connEI)
        print("Closed")
    end)
end
tmr.alarm(1, (timeping*60000), 1, function() pushData() end )