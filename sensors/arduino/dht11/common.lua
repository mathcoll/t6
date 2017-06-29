function getBootReason()
    rawcode, reason = node.bootreason()
    --print(reason)
    if r == rawcode then
        return "power-on"
    elseif rawcode == 2 then
        return "reset (software?)"
    elseif rawcode == 3 then
        return "hardware reset via reset pin"
    elseif rawcode == 4 then
        return "WDT reset (watchdog timeout)"
    end
end

-- NTP, require firmware
function timeSynch()
    sntp.sync('81.6.42.224',
      function(sec,usec,server)
        print('sync', sec, usec, server)
      end,
      function()
       print('failed!')
      end
    )
end

function readDHT11()
    DHT=require("dht11")
    DHT.init(DHT_PIN)
    Temperature = DHT.getTemperature()
    Humidity = DHT.getHumidity()
    Glc = DHT.getLastChecked()
    --print("-----> Temperature"..Temperature.."; ".."Humidity:"..Humidity)
    DHT = nil
    package.loaded["dht11"]=nil
end

-- Wifi
function getModeString(mode)
    if mode == 0 then
        return "Soft AP"
    elseif mode == 1 then
        return "Station"
    elseif mode == 2 then
        return "Both AP/S"
    end
end

-- Wifi
function getStatusString(status)
    if status == 0 then
        return "STATION IDLE"
    elseif status == 4 then
        return "STATION CONNECTING"
    elseif status == 2 then
        return "STATION WRONG PASSWORD"
    elseif status == 3 then
        return "STATION NO AP FOUND"
    elseif status == 4 then
        return "STATION CONNECT FAIL"
    elseif status == 5 then
        return "STATION GOT IP"
    end
end
