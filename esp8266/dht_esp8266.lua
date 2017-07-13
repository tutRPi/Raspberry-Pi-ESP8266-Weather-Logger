local SSID = "WIFI-NAME"
local SSID_PASSWORD = "WIFI-PASSWORD"
local SIGNAL_MODE = wifi.PHYMODE_N
DHT_PIN = 4
INTERVAL = 30 -- seconds
RASPBERRY_PI_URL = "http://192.168.1.80:8000/esp8266_trigger"
SERVER_PASSWORD = "tutorials-raspberrypi.de"


function wait_for_wifi_conn ( )
   tmr.alarm (1, 1000, 1, function ( )
      if wifi.sta.getip ( ) == nil then
         print ("Waiting for Wifi connection")
      else
         tmr.stop (1)
         print ("ESP8266 mode is: " .. wifi.getmode ( ))
         print ("The module MAC address is: " .. wifi.ap.getmac ( ))
         print ("Config done, IP is " .. wifi.sta.getip ( ))
      end
   end)
end

function transmit_msg(data)
    -- send http request to Raspberry Pi
    ok, json = pcall(sjson.encode, data)
    if ok then        
        http.post(RASPBERRY_PI_URL, 
            'Content-Type: application/json\r\n',
            json,
            function(code, data)
                if (code < 0) then
                    print("HTTP request failed")
                --else
                --    print(code, data)
                end
        end)
    else
        return false
    end
end

function readDHTValues()
    status, temp, humi, temp_dec, humi_dec = dht.read(DHT_PIN)
    if status == dht.OK then
        return {temperature= temp, humidity= humi}    
    else
        return false
    end
end

function main()
    for i=1,10 do
        data = readDHTValues()
        if data ~= false then
            
            data["sender_id"] = wifi.ap.getmac()
            data["password"] = SERVER_PASSWORD
        
            transmit_msg(data)
            break
        end
    end
end

-- Configure the ESP as a station (client)
wifi.setmode(wifi.STATION)
wifi.setphymode(SIGNAL_MODE)
wifi.sta.config(SSID, SSID_PASSWORD)
wifi.sta.autoconnect(1)

-- Hang out until we get a wifi connection before the httpd server is started.
wait_for_wifi_conn ( )


tmr.alarm(2, INTERVAL * 1000, tmr.ALARM_AUTO, function ()
    main()
end)
