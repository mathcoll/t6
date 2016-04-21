-- Title   : DHT11 Webserver
-- Author  : Claus Kuehnel
-- Date    : 2015-06-06
-- Id      : dht11_webserver.lua
-- Firmware: nodemcu_float_0.9.6-dev_20150406
-- Copyright © 2015 Claus Kuehnel info[at]ckuehnel.ch

PIN = 3 -- data pin of DHT11
bearer = ""
easyiothost = "192.168.0.2"
easyiotip = "192.168.0.2"
easyiotport = 3000

DHT=require("dht11")
DHT.init(PIN)

function readDHT11()
    DHT= require("dht11")
    DHT.init(PIN)
    t = DHT.getTemp()
    h = DHT.getHumidity()
    if h == nil then
        error = 1
        print("Error reading from DHT11")
    else
        error = 0
        print("readDHT11() ==> Temperature: "..t.." °C", "Humidity: "..h.."%")
    end
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
    print("Posting data to "..easyiothost..":"..easyiotport.." (FLOW=")
    
    connEI=net.createConnection(net.TCP, 0)
    connEI:connect(easyiotport, easyiotip) 
    connEI:on("connection", function(connEI, c)
        connEI:send("POST /v2.0.1/data HTTP/1.1\r\n")
        connEI:send("Host: "..easyiotip.."\r\n")
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
        print("Closed\n")
    end)
end

srv=net.createServer(net.TCP)
srv:listen(80, function(conn)
    conn:on("receive", function(conn, payload)
        command = string.sub(payload, 6,10) -- Get characters 6 to 10
        print("Got query...", command)
        print("Heap: "..node.heap().." Bytes")
        print("Time since start: "..tmr.time().." sec")

        -- print("Print payload:\n"..payload)
        reply_header = "<html><head><title>NodeMCU Server</title><meta charset='UTF-8' /></head><body><h1>DHT11 sensor</h1><font size=\"+2\">" 
        reply = reply_header
        if (command == "temp") then
        
        elseif (command == "humi") then
        
        else
            readDHT11()
            reply = reply.."Temperature: "..t.."°C<br />"
            reply = reply.."Humidity: "..h.."%"
            reply = reply.."</font></body></html>"
        end
        payloadLen = string.len(reply)
        conn:send("HTTP/1.1 200 OK\r\n")
        conn:send("Content-Length:" .. tostring(payloadLen) .. "\r\n")
        conn:send("Connection:close\r\n\r\n")
        conn:send(reply)
        collectgarbage()
    end)

    conn:on("sent",function(conn)
        conn:close()
    end)
end)

tmr.alarm(1, 600000, 1, function() pushData() end )
