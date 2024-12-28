import logging
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from store.mqtt_handler import init_mqtt, latest_ble_data, latest_room_message, mmwave_data

logging.getLogger('werkzeug').disabled = True

app = Flask(__name__)
socketio = SocketIO(app)

init_mqtt(app, socketio)

@app.route('/')
def index() -> str:
    return render_template('index.html')

@app.route('/latest_position')
def latest_position():
    global latest_ble_data
    return jsonify({"x": latest_ble_data.get("x", 0), "y": latest_ble_data.get("y", 0)})

@app.route('/latest_room')
def latest_room():
    with latest_room_message.get_lock():  # Ensure thread-safe access
        room = latest_room_message.value.decode('utf-8')  # Decode bytes to string
    print(f"Serving latest_room_message: {room}")
    return jsonify({"room": room})

@app.route('/latest_mmwave')
def latest_mmwave():
    global mmwave_data
    return jsonify(mmwave_data)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)