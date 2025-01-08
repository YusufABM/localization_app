import logging
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO
from store.mqtt_handler import (
    init_mqtt,
    latest_ble_data,
    mmwave_data,
)
from store.database_handler import DatabaseHandler
from store.mqtt_handler import publish_hybrid_data

logging.getLogger('werkzeug').disabled = True

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize MQTT
init_mqtt(app, socketio)

# Initialize database handler
db_handler = DatabaseHandler()

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/latest_BLE')
def latest_position():
    global latest_ble_data
    return jsonify({"x": latest_ble_data.get("x", 0), "y": latest_ble_data.get("y", 0)})

@app.route('/latest_mmwave')
def latest_mmwave():
    global mmwave_data
    return jsonify(mmwave_data)


@app.route('/publish_hybrid_data', methods=['POST'])
def publish_hybrid_data_endpoint():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        room = data.get("room")

        if not all([user_id, room]):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        publish_hybrid_data(user_id, room)
        return jsonify({"status": "success", "message": "Data published to MQTT"})
    except Exception as e:
        print(f"Error in /publish_hybrid_data: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# For Latency experiement
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


# For Accuracy experiment
@app.route('/save_button_click', methods=['POST'])
def save_button_click():
    try:
        data = request.json
        required_fields = ['button_x', 'button_y', 'sensor_x', 'sensor_y', 'timestamp']

        if not all(field in data for field in required_fields):
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        db_handler.insert_button_click(
            button_x=float(data['button_x']),
            button_y=float(data['button_y']),
            mmwave_x=float(data['sensor_x']) if data['sensor_x'] else None,
            mmwave_y=float(data['sensor_y']) if data['sensor_y'] else None,
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
