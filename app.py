import logging
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO
from store.mqtt_handler import (
    init_mqtt,
    mqtt_client,
    latest_ble_data,
    latest_room_message,
    mmwave_data,
)
from store.hybrid_localization import hybrid_localization
from store.database_handler import DatabaseHandler

logging.getLogger('werkzeug').disabled = True

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize MQTT
init_mqtt(app, socketio)

# Initialize database handler
db_handler = DatabaseHandler()

floor_data = [
    {"id": "Office", "bounds": [[1.7, 8.99], [7.55, 11.84]]},
    {"id": "Kitchen", "bounds": [[1.7, 0], [7.55, 5.85]]},
    {"id": "Hallway", "bounds": [[0, 0], [1.85, 11.84]]}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/hybrid_position')
def hybrid_position():
    global latest_ble_data, mmwave_data

    # MQTT topic for publishing the room
    mqtt_topic = "localization/user_room"
    #print("mmWave Data:", mmwave_data)

    # Perform hybrid localization and publish the room to MQTT
    result = hybrid_localization(
        latest_ble_data,
        mmwave_data,
        floor_data,
        mqtt_client,  # Use the shared MQTT client
        mqtt_topic
    )

    return jsonify(result)

@app.route('/latest_position')
def latest_position():
    global latest_ble_data
    return jsonify({"x": latest_ble_data.get("x", 0), "y": latest_ble_data.get("y", 0)})

@app.route('/latest_room')
def latest_room():
    with latest_room_message.get_lock():  # Ensure thread-safe access
        room = latest_room_message.value.decode('utf-8')
    return jsonify({"room": room})

@app.route('/latest_mmwave')
def latest_mmwave():
    global mmwave_data
    return jsonify(mmwave_data)

@app.route('/update_mmwave', methods=['POST'])
def update_mmwave():
    global mmwave_data
    try:
        incoming_data = request.get_json()
        if not incoming_data:
            return jsonify({"status": "error", "message": "No data received"}), 400

        # Validate incoming data
        for sensor, data in incoming_data.items():
            if "x" in data and "y" in data and "angle" in data:
                mmwave_data[sensor] = data
            else:
                print(f"Invalid data for sensor {sensor}: {data}")

        # print("Updated mmWave Data:", mmwave_data)
        return jsonify({"status": "success", "mmwave_data": mmwave_data})

    except Exception as e:
        print("Error updating mmWave data:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/save_time_difference', methods=['POST'])
def save_time_difference():
    try:
        data = request.get_json()
        if 'room' not in data or 'time_difference_ms' not in data or 'source' not in data:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        db_handler.insert_time_difference(
            room=data['room'],
            time_difference_ms=int(data['time_difference_ms']),
            source=data['source']
        )
        print("Time difference saved to database:", data)
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        print("Error saving time difference to database:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route('/save_button_click', methods=['POST'])
def save_button_click():
    try:
        data = request.json
        required_fields = ['button_x', 'button_y', 'mmwave_x', 'mmwave_y', 'timestamp']

        if not all(field in data for field in required_fields):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        db_handler.insert_button_click(
            button_x=float(data['button_x']),
            button_y=float(data['button_y']),
            mmwave_x=float(data['mmwave_x']) if data['mmwave_x'] else None,
            mmwave_y=float(data['mmwave_y']) if data['mmwave_y'] else None,
            timestamp=data['timestamp']
        )

        print("Button click data saved to database:", data)
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        print("Error saving button click data to database:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500

#Get button click data from database
@app.route('/get_button_click_data')
def get_button_click_data():
    try:
        data = db_handler.get_button_click_data()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        print("Error getting button click data from database:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
