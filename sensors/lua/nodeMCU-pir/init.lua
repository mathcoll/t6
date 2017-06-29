dofile("settings.lua")
--dofile("wifi.lua")

local PIRpin = 2
local LEDpin = 1
local SERpin = 4
local last_state = 1
gpio.mode(PIRpin, gpio.INPUT)
gpio.mode(LEDpin, gpio.OUTPUT)
pwm.setup(SERpin, 100, 100)
tmr.alarm(0, 100, 1, function()
    if gpio.read(PIRpin) ~= last_state then
        last_state = gpio.read(PIRpin)
        if last_state == 1 then
            print("Motion Detected ", last_state, node.heap(), gpio.read(PIRpin))
            gpio.write(LEDpin, gpio.HIGH)
            pwm.setduty(SERpin, 256); pwm.start(SERpin); tmr.delay(90000); pwm.stop(SERpin)
        else
            print("No Motion Detected ", last_state, node.heap(), gpio.read(PIRpin))
            gpio.write(LEDpin, gpio.LOW)
            pwm.setduty(SERpin, 1); pwm.start(SERpin); tmr.delay(90000); pwm.stop(SERpin)
        end
    end
end)
