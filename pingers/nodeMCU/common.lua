
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

print(getBootReason())