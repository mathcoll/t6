srv = net.createServer(net.TCP)
srv:listen(PORT, function(conn)
    conn:on("receive", function(conn, payload)
        lc = math.floor((tmr.now() - Glc)/60000000)
        command = string.sub(payload, 6, 9) -- Get characters 6 to 9
        print("Got query...", "'"..command.."'")
        print("Heap: "..node.heap().." Bytes")
        print("Time since start: "..tmr.time().." sec")

        reply = "<html><head>"
            .."<title>NodeMCU Server</title>"
            .."<meta charset='UTF-8' /></head>"
            .."<body><h1>DHT11 sensor</h1>"
            .."<font size=\"+2\">"

        conn:send("HTTP/1.1 200 OK\r\n")
        if (command == "temp") then
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = reply.."Temperature: "..Temperature.."°C<br />"
                .."Last Measure: "..lc.." min ago.<br />"
                .."</font></body></html>"
                
        elseif (command == "humi") then
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = reply.."Humidity: "..Humidity.."%<br />"
                .."Last Measure: "..lc.." min ago.<br />"
                .."</font></body></html>"
                
        elseif (command == "humi.json") then
            conn:send("Content-Type: application/json; charset=utf-8\r\n")
            json = '{"dtepoch":"","value":"'..Humidity..'","text":""}'
            reply = reply.."Humidity: "..Humidity.."%<br />"
                .."Last Measure: "..lc.." min ago.<br />"
                .."</font></body></html>"
                
        elseif (command == "Tmod") then
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = "<a class='list-group-item' href='#'>"
                .."<h4 class='list-group-item-heading'>"
                .." <span aria-hidden='true' class='glyphicon glyphicon-cloud'></span>"
                .." Indoor Temperature"
                .."</h4>"
                .."Temperature module powered by NodeMCU"
                .."<span class='badge'>"..Temperature.."°C</span>"
              .."</a>"
              
        elseif (command == "Hmod") then
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = "<a class='list-group-item' href='#'>"
                .."<h4 class='list-group-item-heading'>"
                .." <span aria-hidden='true' class='glyphicon glyphicon-cloud'></span>"
                .." Indoor Humidity"
                .."</h4>"
                .."Humidity module powered by NodeMCU"
                .."<span class='badge'>"..Humidity.."%</span>"
              .."</a>"
                
        else
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = reply.."Temperature: "..Temperature.."°C<br />"
                .."Humidity: "..Humidity.."%<br />"
                .."Last Measure: "..lc.." min ago.<br />"
                .."</font></body></html>"

        end

--        majorVer,minorVer,devVer,chipid,flashid,flashsize,flashmode,flashspeed=node.info()
--        conn:send("Server: NodeMCU "..majorVer.."."..minorVer.."."..devVer.." (Lua)\r\n")
--        conn:send("X-Powered-By: NodeMCU "..majorVer.."."..minorVer.."."..devVer.."\r\n")
        conn:send("Cache-Control: no-cache\r\n")
        conn:send("Cache-Control: no-store\r\n")
        conn:send("Cache-Control: max-age=0\r\n")
        conn:send("TSV: N\r\n")
        conn:send("Expires: Thu, 01 Dec 1994 16:00:00 GMT\r\n")
        conn:send("Content-Length:"..tostring(string.len(reply)).."\r\n")
        conn:send("Connection:close\r\n\r\n")
        conn:send(reply)
    end)

    conn:on("sent",function(conn)
        conn:close()
    end)
end)
