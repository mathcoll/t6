require("settings")
require("common")
dofile("wifi.lua")

DHT=require("dht11")
DHT.init(DHT_PIN)
Glc=0

print((wakeTime/1000).." seconds awake.")
function goToSleep()
    print(getBootReason())
    
    readDHT11()
    if Temperature >= -60 then
        sendToServer('{ "flow_id": "6d844fbf-29c0-4a41-8c6a-0e9f3336cea3", "value": "'..Temperature..'", "unit": "°C", "mqtt_topic": "couleurs/nodeMCU/temperature", "publish": "true", "save": "true", "timestamp": "" }')
        --tmr.delay(1000) --This is in general a bad idea
        sendToServer('{ "flow_id": "19fc7ca5-a4f1-4af3-91c9-2426bd1a3f0f", "value": "'..Humidity..'", "unit": "percentage", "mqtt_topic": "couleurs/nodeMCU/humidity", "publish": "true", "save": "true", "timestamp": "" }')
        
        DHT = nil
        package.loaded["dht11"]=nil
        
        --tmr.delay(5000) --This is in general a bad idea
    end
    print("going to sleep for "..(sleepTime/60000000).." minutes.")
    
    tmr.alarm(4, wakeTime, 0, function() node.dsleep(sleepTime, 4) end)
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
        connEI:send("User-Agent: NodeMCU 0.9.6 build 20150704 powered by Lua 5.1.4\r\n")
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
        print("connEI closed")
    end)
end
tmr.alarm(3, wakeTime/3, 0, function() goToSleep() end)
