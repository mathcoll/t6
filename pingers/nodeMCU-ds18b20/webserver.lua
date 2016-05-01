require('ds18b20')

ds18b20.setup(gpio0)

srv=net.createServer(net.TCP)
srv:listen(PORT, function(conn)
    conn:on("receive", function(conn, payload)
        command = string.sub(payload, 6, 9) -- Get characters 6 to 9
        reply = "<html><head>"
            .."<title>NodeMCU Server</title>"
            .."<meta charset='UTF-8' /></head>"
            .."<body><h1>DS18B20 sensor</h1>"
            .."<font size=\"+2\">"
        conn:send("HTTP/1.1 200 OK\r\n")
                
        if (command == "OTem") then
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = "<a class='list-group-item' href='#'>"
                .."<h4 class='list-group-item-heading'>"
                .." <span aria-hidden='true' class='glyphicon glyphicon-cloud'></span>"
                .." Outdoor Temperature"
                .."</h4>"
                .."DS18B20 module powered by NodeMCU"
                .."<span class='badge'>"..ds18b20.read().."%</span>"
              .."</a>"
              
        elseif (command == "json") then
            conn:send("Content-Type: application/json; charset=utf-8\r\n")
            reply = "{value: '"..ds18b20.read().."', unit:'°C'}"
            
        else
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = reply.."Temperature: "..ds18b20.read().."°C<br />"
                .."</font></body></html>"
                
        end
        conn:send("Cache-Control: no-cache\r\n")
        conn:send("Cache-Control: no-store\r\n")
        conn:send("Cache-Control: max-age=0\r\n")
        conn:send("TSV: N\r\n")
        conn:send("Access-Control-Allow-Origin: *\r\n")
        conn:send("Expires: Thu, 01 Dec 1994 16:00:00 GMT\r\n")
        conn:send("Content-Length:"..tostring(string.len(reply)).."\r\n")
        conn:send("Connection:close\r\n\r\n")
        conn:send(reply)
    end)

    conn:on("sent",function(conn)
        conn:close()
    end)
end)