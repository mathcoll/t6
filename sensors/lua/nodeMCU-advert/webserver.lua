--Thanks to Thomas Shaddack for optimizations - 20150707 ARe
dns_ip=wifi.ap.getip()
local i1,i2,i3,i4=dns_ip:match("(%d+)%.(%d+)%.(%d+)%.(%d+)")
x00=string.char(0)
x01=string.char(1)
dns_str1=string.char(128)..x00..x00..x01..x00..x01..x00..x00..x00..x00
dns_str2=x00..x01..x00..x01..string.char(192)..string.char(12)..x00..x01..x00..x01..x00..x00..string.char(3)..x00..x00..string.char(4)
dns_strIP=string.char(i1)..string.char(i2)..string.char(i3)..string.char(i4)
svr=net.createServer(net.UDP)
svr:on("receive",function(svr,dns_pl)
  print(dns_pl)
  decodedns(dns_pl)
  svr:send(dns_tr..dns_str1..dns_q..dns_str2..dns_strIP)
  collectgarbage("collect")
end)
svr:listen(53)

function decodedns(dns_pl)
  local a=string.len(dns_pl)
  dns_tr = string.sub(dns_pl, 1, 2)
  local bte=""
  dns_q=""
  local i=13
  local bte2=""
  while bte2 ~= "0" do
    bte = string.byte(dns_pl,i)
    bte2 = string.format("%x", bte )
    dns_q = dns_q .. string.char(bte)
    i=i+1
  end
end


srv=net.createServer(net.TCP)
srv:listen(PORT, function(conn)
    conn:on("receive", function(conn, payload)
        command = string.sub(payload, 6, 9)
        conn:send("HTTP/1.1 200 OK\r\n")
        print("url", url)
        print("Command", command)
        
        conn:send("Content-Type: text/html; charset=utf-8\r\n")
        reply = "<!doctype html>"
            .."<html lang='en'>"
            .."<head>"
            .."  <meta charset='utf-8'>"
            .."  <title>Test</title>"
            .."</head>"
            .."<body>"
            .."  <p>"
            .."    Very Cool Advert --"
            .."  </p>"
            .."</body>"
            .."</html>"

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
