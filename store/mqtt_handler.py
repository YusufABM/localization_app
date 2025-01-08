from multiprocessing import Array
import ctypes
from flask_mqtt import Mqtt
import json

global latest_ble_data
latest_ble_data = {"x": 0, "y": 0}

global mmwave_data
mmwave_data = {
    "office": {"x": 0, "y": 0, "angle": 0, "direction": "Unknown", "target_count": 0},
    "kitchen": {"x": 0, "y": 0, "angle": 0, "direction": "Unknown", "target_count": 0}
}

mqtt_client = Mqtt()

def load_secrets():
    """Load MQTT secrets from the /secrets/mqtt_secrets.json file."""
    with open('./secrets/connectioninfo_secrets.json', 'r') as secrets_file:
        return json.load(secrets_file)

def publish_hybrid_data(user_id, room):
    """Publish hybrid localization data to the MQTT broker."""
    try:
        topic = "home/userlocation"
        payload = {
            "user_id": user_id,
            "room": room,
        }
        mqtt_client.publish(topic, json.dumps(payload), qos=0)
        print(f"Published to MQTT: {topic}, {payload}")
    except Exception as e:
        print(f"Error publishing hybrid data to MQTT: {e}")

def init_mqtt(app, socketio):
    # Load secrets
    secrets = load_secrets()

    # Configure MQTT using secrets
    app.config['MQTT_BROKER_URL'] = secrets['MQTT_BROKER_URL']
    app.config['MQTT_BROKER_PORT'] = secrets['MQTT_BROKER_PORT']
    app.config['MQTT_USERNAME'] = secrets['MQTT_USERNAME']
    app.config['MQTT_PASSWORD'] = secrets['MQTT_PASSWORD']
    app.config['MQTT_KEEPALIVE'] = secrets['MQTT_KEEPALIVE']
    app.config['MQTT_TLS_ENABLED'] = secrets['MQTT_TLS_ENABLED']

    mqtt_client.init_app(app)

    @mqtt_client.on_connect()
    def handle_connect(client, userdata, flags, rc):
        if rc == 0:
            print('Connected successfully')
            mqtt_client.subscribe('espresense/companion/Beacon:IPhone/#')  # Subscribe to topic
            mqtt_client.subscribe('mmwave-office/sensor/_target1_x/state')
            mqtt_client.subscribe('mmwave-office/sensor/_target1_y/state')
            mqtt_client.subscribe('mmwave-office/sensor/_target1_angle/state')
            mqtt_client.subscribe('mmwave-kitchen/sensor/_target1_x/state')
            mqtt_client.subscribe('mmwave-kitchen/sensor/_target1_y/state')
            mqtt_client.subscribe('mmwave-kitchen/sensor/_target1_angle/state')
            mqtt_client.subscribe('mmwave-office/sensor/_target1_direction/state')
            mqtt_client.subscribe('mmwave-kitchen/sensor/_target1_direction/state')
            mqtt_client.subscribe('mmwave-kitchen/sensor/_all_target_counts/state')
            mqtt_client.subscribe('mmwave-office/sensor/_all_target_counts/state')
        else:
            print('Bad connection. Code:', rc)

    @mqtt_client.on_message()
    def handle_mqtt_message(client, userdata, message):
        global latest_ble_data
        global mmwave_data
        try:

            payload = message.payload.decode().strip()
            topic = message.topic

            if payload == "First Floor":
                print(f"First Floor message received. Skipping...'{payload}'")
                return

            if topic.startswith('mmwave-office/sensor/'):
                if '_target1_x' in topic:
                    mmwave_data['office']['x'] = float(payload)
                elif '_target1_y' in topic:
                    mmwave_data['office']['y'] = float(payload)
                elif '_target1_angle' in topic:
                    mmwave_data['office']['angle'] = float(payload)
                elif '_target1_direction' in topic:
                    mmwave_data['office']['direction'] = payload
                elif '_all_target_counts' in topic:
                    mmwave_data['office']['target_count'] = payload
                #print(f"Updated mmWave office data: {mmwave_data['office']}")
                socketio.emit('update_mmwave', {'location': 'office', 'data': mmwave_data['office']})
                return

            if topic.startswith('mmwave-kitchen/sensor/'):
                if '_target1_x' in topic:
                    mmwave_data['kitchen']['x'] = float(payload)
                elif '_target1_y' in topic:
                    mmwave_data['kitchen']['y'] = float(payload)
                elif '_target1_angle' in topic:
                    mmwave_data['kitchen']['angle'] = float(payload)
                elif '_target1_direction' in topic:
                    mmwave_data['kitchen']['direction'] = payload
                elif '_all_target_counts' in topic:
                    mmwave_data['kitchen']['target_count'] = int(payload)
                #print(f"Updated mmWave kitchen data: {mmwave_data['kitchen']}")
                socketio.emit('update_mmwave', {'location': 'kitchen', 'data': mmwave_data['kitchen']})
                return

            data = json.loads(payload)
            latest_ble_data["x"] = data.get("x", 0)
            latest_ble_data["y"] = data.get("y", 0)
            #print(f"Updated BLE data: {latest_ble_data}")
            socketio.emit('update_ble', latest_ble_data)

        except json.JSONDecodeError as e:
            print(f"Failed to decode JSON payload: {e}")
            print(f"RAW payload: '{payload}'")
        except Exception as e:
            print(f"Unexpected error: {e}")
            print(f"RAW payload: '{payload}'")

    return mqtt_client