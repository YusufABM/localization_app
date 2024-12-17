from flask import Flask, render_template
import paho.mqtt.client as mqtt
import json
from datetime import datetime

app = Flask(__name__)

# MQTT Configuration
MQTT_BROKER = "mqtt.example.com"
MQTT_PORT = 1883
MQTT_TOPIC = "ble/coordinates"

# Store BLE location
latest_ble_data = None
logged_data = []

#def on_message(client, userdata, msg):
#    global latest_ble_data
#    latest_ble_data = json.loads(msg.payload.decode())
#    print(f"BLE Reported: {latest_ble_data}")



@app.route('/')
def index() -> str:
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
