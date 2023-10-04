import base64
import jwt
import os
import websockets
import asyncio
import json
from playsound import playsound

apikey = ""
apisecret = ""
object_id = ""
object_key = ""
signature = jwt.encode({ "object_id": object_id }, object_key, algorithm="HS256")
concat_str = apikey + ":" + apisecret
encoded_str = base64.b64encode(concat_str.encode()).decode()

async def connect_to_server():
    headers = {'Authorization': 'Basic ' + encoded_str}
    async with websockets.connect('ws://', extra_headers=headers) as websocket:
        payload = {
            "command": "claimObject",
            "object_id": object_id,
            "t6_feat_audio": True,
            "signature": signature
        }
        await websocket.send(json.dumps(payload))	# claimObject
        await websocket.send(json.dumps({"command": "subscribe","channel": "audiodevice,python"})) # Subscribe

        async for message in websocket:
            if isinstance(message, (bytes, bytearray)):
                with open("audio.mp3", "wb") as file:
                    file.write(message)
                playsound('audio.mp3')
                os.remove("audio.mp3")

#asyncio.run(connect_to_server())
asyncio.get_event_loop().run_until_complete(connect_to_server())