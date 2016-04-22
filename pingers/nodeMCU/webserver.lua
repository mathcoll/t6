srv = net.createServer(net.TCP)
srv:listen(PORT, function(conn)
    conn:on("receive", function(conn, payload)
        print("Got query...", command)
        print("Heap: "..node.heap().." Bytes")
        print("Time since start: "..tmr.time().." sec")

        reply = "<html><head>"
            .."<title>NodeMCU Server</title>"
            .."<meta charset='UTF-8' /></head>"
            .."<body><h1>DHT11 sensor</h1>"
            .."<font size=\"+2\">"

--        readDHT11()
        command = string.sub(payload, 6, 10) -- Get characters 6 to 10
        if (command == "temp") then
            reply = reply.."Temperature: "..Temperature.."°C<br />"
                .."</font></body></html>"
        elseif (command == "humi") then
            reply = reply.."Humidity: "..Humidity.."%<br />"
                .."</font></body></html>"
        else
            reply = reply.."Temperature: "..Temperature.."°C<br />"
                .."Humidity: "..Humidity.."%<br />"
                .."</font></body></html>"
        end
--        majorVer,minorVer,devVer,chipid,flashid,flashsize,flashmode,flashspeed=node.info()
--        conn:send("Server: NodeMCU "..majorVer.."."..minorVer.."."..devVer.." (Lua)\r\n")
--        conn:send("X-Powered-By: NodeMCU "..majorVer.."."..minorVer.."."..devVer.."\r\n")
        conn:send("HTTP/1.1 200 OK\r\n")
        conn:send("Cache-Control: no-cache\r\n")
        conn:send("Cache-Control: no-store\r\n")
        conn:send("Cache-Control: max-age=0\r\n")
        conn:send("TSV: N\r\n")
        conn:send("Expires: Thu, 01 Dec 1994 16:00:00 GMT\r\n")
        conn:send("Content-Length:"..tostring(string.len(reply)).."\r\n")
        conn:send("Connection:close\r\n\r\n")
        conn:send(reply)
        collectgarbage()
    end)

    conn:on("sent",function(conn)
        conn:close()
    end)
end)
