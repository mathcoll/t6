wifi.setmode(wifi.SOFTAP)
print("SSID is: " .. cfg.ssid .. " and PASSWORD is: " .. cfg.pwd)

wifi.ap.config(cfg)
ap_mac = wifi.ap.getmac()
dns_ip=wifi.ap.getip()

print("AP MAC: ", ap_mac)
print("AP IP:", dns_ip)
