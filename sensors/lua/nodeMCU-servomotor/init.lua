dofile("settings.lua")
dofile("wifi.lua")
dofile("webserver.lua") -- For slider

local state = 0
gpio.mode(PIRpin, gpio.INPUT)
gpio.mode(LEDpin, gpio.OUTPUT)
pwm.setup(SERpin, 100, 100)
tmr.alarm(1, 100, 1, function()
    if gpio.read(PIRpin) ~= state then
        state = gpio.read(PIRpin)
        if state == 1 then
            print("Motion Detected ", state, node.heap())
            gpio.write(LEDpin, gpio.HIGH)
            --pwm.setduty(SERpin, 256); pwm.start(SERpin); tmr.delay(90000); pwm.stop(SERpin)
        else
            print("No Motion Detected ", state, node.heap())
            gpio.write(LEDpin, gpio.LOW)
            --pwm.setduty(SERpin, 1); pwm.start(SERpin); tmr.delay(90000); pwm.stop(SERpin)
        end
    end
end)
