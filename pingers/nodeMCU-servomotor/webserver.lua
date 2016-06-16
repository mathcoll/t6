srv=net.createServer(net.TCP)
srv:listen(PORT, function(conn)
    conn:on("receive", function(conn, payload)
        command = string.sub(payload, 6, 9)
        conn:send("HTTP/1.1 200 OK\r\n")
        --print("Command", command)
        if (command == "set/") then
            conn:send("Content-Type: application/json; charset=utf-8\r\n")
            value = string.sub(payload, 10, 13)
            print("value ", value)
            pwm.setduty(gpio2, value); pwm.start(gpio2); tmr.delay(delay); pwm.stop(gpio2)
            reply = "{\"status\":\"ok\"}"

        else
            conn:send("Content-Type: text/html; charset=utf-8\r\n")
            reply = "<!doctype html>"
                .."<html lang='en'>"
                .."<head>"
                .."  <meta charset='utf-8'>"
                .."  <title>NodeMCU servomotor slider</title>"
                .."  <link rel='stylesheet' href='//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css'>"
                .."  <script src='//code.jquery.com/jquery-1.10.2.js'></script>"
                .."  <script src='//code.jquery.com/ui/1.11.4/jquery-ui.js'></script>"
                .."  <script>"
                .."    $(function() {"
                .."      $( '#slider' ).slider({ orientation: 'vertical', range: 'max', min: 1, max: 256, value: 1, slide: function( event, ui ) { $( '#value' ).val( ui.value ); }"
                .."    });"
                .."    $( '#value' ).val( $( '#slider' ).slider( 'value' ) );"
                .."    $( '#slider' ).on( 'slidechange', function( event, ui ) {"
                .."      console.log('Value = '+ui.value);"
                .."      var v=ui.value;"
                .."      if (ui.value<100) v = '0'+ui.value;"
                .."      if (ui.value<10) v = '00'+ui.value;"
                .."      $.get( \"/set/\"+v, function( data ) {});"
                .."    } );"
                .."    });"
                .."  </script>"
                .."</head>"
                .."<body>"
                .."  <p>"
                .."    <label for='value'>Value:</label>"
                .."    <input type='text' id='value' readonly style='border:0;'>"
                .."  </p>"
                .."  <div id='slider' style='height:200px;'></div>"
                .."</body>"
                .."</html>"
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
