local M = {}
Humidity=0
HumidityDec=0
Temperature=0
TemperatureDec=0
Checksum = 0
ChecksumTest=0
LastChecked=0

function M.init(pin)
    Humidity=0
    HumidityDec=0
    Temperature=0
    TemperatureDec=0
    status, temp, humi, temp_dec, humi_dec = dht.read(pin)
    Temperature=math.floor(temp)
    TemperatureDec=temp
    Humidity=math.floor(humi)
    HumidityDec=humi
    
    if status == dht.OK then
        --print("DHT Temperature:"..temp..";".."Humidity:"..humi)
        LastChecked=tmr.now() -- timestamp ?!
    elseif status == dht.ERROR_CHECKSUM then
        print( "DHT Checksum error." )
    elseif status == dht.ERROR_TIMEOUT then
        print( "DHT timed out." )
    end
end
 
function M.getTemperature()
    return Temperature
end
 
function M.getHumidity()
    return Humidity
end
 
function M.getLastChecked()
    return LastChecked
end

return M
