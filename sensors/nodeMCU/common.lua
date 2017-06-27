
function getBootReason()
    rawcode, reason = node.bootreason()
    print(reason)
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