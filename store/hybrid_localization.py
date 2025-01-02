def hybrid_localization(ble_data, mmwave_data, floor_data, mqtt_client, topic):
    """
    Combines BLE and mmWave localization estimates using constraints and publishes the room to MQTT.

    :param ble_data: dict with BLE x, y estimates.
    :param mmwave_data: dict with mmWave x, y, and other sensor data per room.
    :param floor_data: list containing room definitions with bounds.
    :param mqtt_client: MQTT client instance.
    :param topic: MQTT topic to publish the room location.
    :return: dict with combined x, y estimate and identified room.
    """
    scale_factor = 50
    map_height = 592

    source = "BLE"
    combined_position = {
        "x": ble_data["x"],
        "y": ble_data["y"]
    }

    def within_bounds(bounds, x, y):
        """Check if x, y coordinates are within given bounds."""
        x_min, y_min = bounds[0]
        x_max, y_max = bounds[1]
        return x_min <= x <= x_max and y_min <= y <= y_max

    # Extract bounds for each room
    room_bounds = {room["id"]: room["bounds"] for room in floor_data}

    # Check mmWave data for valid target counts
    valid_mmwave_sensor = None
    for sensor, data in mmwave_data.items():
        if (
            data.get("target_count") and int(data["target_count"]) > 0 and
            data.get("globalX") is not None and data.get("globalY") is not None
        ):
            valid_mmwave_sensor = sensor
            break

    if valid_mmwave_sensor:
        mmwave_position = mmwave_data[valid_mmwave_sensor]
        combined_position["x"] = mmwave_position["globalX"] / scale_factor
        combined_position["y"] = (map_height - mmwave_position["globalY"]) / scale_factor
        user_room = valid_mmwave_sensor.capitalize()
        source = "mmWave"
    else:
        # No valid mmWave data, fall back to BLE
        user_room = "Unknown"
        combined_position["x"] = ble_data["x"]
        combined_position["y"] = ble_data["y"]
        for room, bounds in room_bounds.items():
            if within_bounds(bounds, combined_position["x"], combined_position["y"]):
                user_room = room
                break

    # Publish room information to MQTT
    mqtt_client.publish(topic, user_room)

    return {"x": combined_position["x"], "y": combined_position["y"], "room": user_room, "source": source}
