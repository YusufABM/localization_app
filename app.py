from flask import Flask, render_template, jsonify
from store.mqtt_handler import init_mqtt, latest_ble_data, latest_room_message
import logging


logging.getLogger('werkzeug').disabled = True

from datetime import datetime

app = Flask(__name__)

init_mqtt(app)


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


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

