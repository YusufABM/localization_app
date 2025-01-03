import { calculateButtonPosition, searchButtonsOnLine } from "./data.js";
import { floor, furniture, nodes, radarPositions, fetchLatestBLE,latestBLEPosition, fetchLatestRoom, latestRoom, fetchLatestMmwaveData, latestMmwaveData, fetchLatestHybridPosition, latestHybridPosition } from "./data.js";
import { g } from "./map.js";


// Config and scaling
const width = window.innerWidth;
const height = window.innerHeight;
const scaleFactor = 50;
let  yStep;
let  xStep;
let hue = 0;
export let mmWaveData = {};
export let bleData = {};

// Calculate the map's size in pixels
const mapWidth = (floor[0].bounds[1][0] - floor[0].bounds[0][0]) * scaleFactor;
const mapHeight = (floor[0].bounds[1][1] - floor[0].bounds[0][1]) * scaleFactor;

// Periodically fetch and update position and room name
export function startPositionUpdates(mapHeight) {
  setInterval(async () => {
    //await fetchLatestRoom();
    await fetchLatestBLE();
    //await fetchLatestMmwaveData();
    //await fetchLatestHybridPosition();
    //calculateMmwaveGlobalCoordinates(mapHeight);
    //renderTargetCount(radarPositions);
    //await syncMmwaveDataToBackend();
     // Calculate mmWave global coordinates
    //renderHybridPosition(mapHeight); // Update hybrid position
   renderBLE(mapHeight); // Update position and room name
    //renderMmwaveSensors(mapHeight); // Update mmWave sensor readings
  }, 100);
}


function syncMmwaveDataToBackend() {
  //console.log("Syncing mmWave Data:", latestMmwaveData); // Debug log before sending
  fetch('/update_mmwave', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(latestMmwaveData),
  })
    .then((response) => response.json())
    .catch((error) => console.error('Error syncing mmWave data:', error));
}


// Render bounds (map border)
export function renderBounds(bounds) {
  const [[xMin, yMin], [xMax, yMax]] = bounds;
  g.append("rect")
    .attr("x", xMin * scaleFactor)
    .attr("y", yMin * scaleFactor)
    .attr("width", (xMax - xMin) * scaleFactor)
    .attr("height", (yMax - yMin) * scaleFactor)
    .attr("fill", "none")
    .attr("stroke", "#f5f7f7")
    .attr("stroke-width", 0);
}

// Render latest position and room name on the map
export function renderBLE(mapHeight) {
  let positionDot = g.select(".latest-position-dot");
  let roomText = g.select(".latest-room-text");

  let ble = { x : latestBLEPosition.x * scaleFactor, y : mapHeight - latestBLEPosition.y * scaleFactor, room : estimateUserRoom(latestBLEPosition.x, latestBLEPosition.y)};
  bleData = ble;

  if (positionDot.empty()) {
    // Append the circle if it doesn't exist
    positionDot = g.append("circle")
      .attr("class", "latest-position-dot")
      .attr("r", 5)
      .attr("fill", "red");
  }

  if (roomText.empty()) {
    // Append the room name text if it doesn't exist
    roomText = g.append("text")
      .attr("class", "latest-room-text")
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .attr("font-family", "Arial");
  }

  // Update the circle's position
  positionDot
    .attr("cx", ble.x)
    .attr("cy", ble.y);


  // Update the room name position and text
  roomText
    .attr("x", ble.x)
    .attr("y", ble.y - 10)
    .text(ble.room);
}


function mapAngle(input) {
  // Shift input range from [-60, 60] to [0, 120]
  const shiftedInput = input + 60;

  // Normalize to [0, 1]
  const normalizedInput = shiftedInput / 120;

  // Scale to [0, 120]
  const mappedValue = normalizedInput * 120;

  return mappedValue;
}



/**
 * Perform mmWave calculations and update latestMmwaveData with global Cartesian coordinates.
 * @param {Object} mapHeight - The height of the map for coordinate inversion.
 */
export function calculateMmwaveGlobalCoordinates(mapHeight) {
  const sensors = Object.keys(latestMmwaveData);

  sensors.forEach((sensor) => {
    const data = latestMmwaveData[sensor];
    const radar = radarPositions[sensor];

    if (!data || !radar || (data.x === 0 && data.y === 0)) {
      //console.warn(`Skipping sensor: ${sensor} - Invalid data or radar configuration`);
      latestMmwaveData[sensor].globalX = null;
      latestMmwaveData[sensor].globalY = null;
      return;
    }

    const distance = Math.sqrt(data.x ** 2 + data.y ** 2) / 1000; // Convert mm to meters
    const mappedAngle = mapAngle(data.angle);
    const effectiveAngle = radar.orientation + mappedAngle;
    const angleInRadians = effectiveAngle * (Math.PI / 180);

    let globalX = radar.x + distance * Math.cos(angleInRadians);
    let globalY = radar.y + distance * Math.sin(angleInRadians);

    if (isNaN(globalX) || isNaN(globalY)) {
      console.warn(`Invalid coordinates for sensor: ${sensor}`);
      latestMmwaveData[sensor].globalX = null;
      latestMmwaveData[sensor].globalY = null;
      return;
    }

    globalX = globalX * scaleFactor;
    globalY = mapHeight - globalY * scaleFactor;

    latestMmwaveData[sensor].globalX = globalX;
    latestMmwaveData[sensor].globalY = globalY;

    // Save x an y as a gloabl variable

    //console.log(`Sensor: ${sensor}, Global X: ${globalX.toFixed(2)}, Global Y: ${globalY.toFixed(2)}`);
  });

 // console.log("Processed latestMmwaveData:", latestMmwaveData);
}

// Render target count for each radar sensor as texts
export function renderTargetCount(radarPositions) {
  const sensors = Object.keys(latestMmwaveData);

  sensors.forEach((sensor) => {
    const data = latestMmwaveData[sensor];
    const radar = radarPositions[sensor];

    //console.log("Target count data:", data.lastUpdated);

    let targetCount = data?.target_count ?? 0; // Safely get the target count, default to 0

    // Check if the last updated time is more than 300 ms ago
    if (Date.now() - data.lastUpdated > 300) {
      targetCount = 0;
    }

    if (radar && radar.x !== undefined && radar.y !== undefined) {
      let targetCountText = g.select(`.target-count-${sensor}`);

      if (targetCountText.empty()) {
        targetCountText = g.append("text")
          .attr("class", `target-count-${sensor}`)
          .attr("x", radar.x * scaleFactor)
          .attr("y", mapHeight - radar.y * scaleFactor)
          .attr("fill", "black")
          .attr("font-size", "12px")
          .attr("font-family", "Arial")
          .attr("text-anchor", "middle");
      }

      targetCountText.text(`Target Count: ${targetCount}`); // Dynamically update the target count
    } else {
      console.warn("Invalid radar position for sensor:", sensor);
    }
  });
}




/**
 * Render mmWave sensors using precomputed global coordinates.
 * @param {Object} mapHeight - The height of the map for coordinate inversion.
 */
export function renderMmwaveSensors(mapHeight) {
  calculateMmwaveGlobalCoordinates(mapHeight);
  const sensors = Object.keys(latestMmwaveData);

  // Map sensor data to renderable objects, with validation
  const sensorData = sensors
    .map((sensor) => {
      const data = latestMmwaveData[sensor];
      if (!data || typeof data.globalX !== "number" || typeof data.globalY !== "number" || Date.now() - data.lastUpdated > 200) {
        //console.warn(`Skipping sensor: ${sensor} - Invalid data, global coordinates, or outdated data`);
        return null;
      }
      return {
        id: sensor,
        x: data.globalX,
        y: data.globalY,
      };
    })
    .filter(Boolean); // Remove null or invalid entries

  // Bind data to circles
  const circles = g.selectAll(".sensor-circle").data(sensorData, (d) => d.id);
  let roomText = g.select(".latest-room-text");
  if (roomText.empty()) {
    // Append the room name text if it doesn't exist
    roomText = g.append("text")
      .attr("class", "latest-room-text")
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "black")
      .attr("font-weight", "bold")
      .attr("font-family", "Arial");
  }

  const lastSensor = sensorData[sensorData.length - 1];
  const room = estimateUserRoom(lastSensor.x/ scaleFactor, (mapHeight - lastSensor.y) / scaleFactor);

  // Update existing circles
  circles
    .transition()
    .duration(200)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  // Enter new circles
  circles
    .enter()
    .append("circle")
    .attr("class", "sensor-circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 5)
    .attr("fill", `hsl(${hue}, 100%, 50%)`)
    .attr("fill-opacity", 0.6)
    .attr("stroke", "black")
    .attr("stroke-width", 1);
  // Update room text
  if (lastSensor) {
    roomText
      .attr("x", lastSensor.x)
      .attr("y", lastSensor.y - 10)
      .text(room);
  }
  // Remove circles not in the current data
  circles.exit().remove();

  // Update the latest mmWave data
  if (sensorData.length > 0) {
    const lastSensor = sensorData[sensorData.length - 1];
    mmWaveData = {
      id: lastSensor.id,
      x: lastSensor.x / scaleFactor,
      y: (mapHeight - lastSensor.y) / scaleFactor,
    };

    // Debug log for updated mmWaveData
    //console.log(`Updated mmWaveData: ${JSON.stringify(mmWaveData)}`);
  } else {
    //console.warn("No valid sensors found to update mmWaveData.");
  }

  // Increment hue for next update
  hue = (hue + 5) % 360;
}


// Render hybrid position on the map
export function renderHybridPosition(mapHeight) {
  let hybridDot = g.select(".hybrid-position-dot");
  let hybridText = g.select(".hybrid-position-text");

  if(latestHybridPosition.x === 0 && latestHybridPosition.y === 0) {
    return;
  }

  if (hybridDot.empty()) {
    // Append the circle if it doesn't exist
    hybridDot = g.append("circle")
      .attr("class", "hybrid-position-dot")
      .attr("r", 5)
      .attr("fill", "green");
  }


  if (hybridText.empty()) {
    // Append the text if it doesn't exist
    hybridText = g.append("text")
      .attr("class", "hybrid-position-text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .attr("font-family", "Arial");
  }

  // Update the circle's position
  hybridDot
    .attr("cx", latestHybridPosition.x * scaleFactor)
    .attr("cy", mapHeight - latestHybridPosition.y * scaleFactor);

  // Update the text's position and content
  hybridText
    .attr("x", latestHybridPosition.x * scaleFactor)
    .attr("y", mapHeight - latestHybridPosition.y * scaleFactor - 10)
    .text(latestHybridPosition.room);
}

// Render rooms
export function renderRooms(rooms) {
  rooms.forEach(room => {
    g.append("polygon")
      .attr("points", room.points.map(([x, y]) => [x * scaleFactor, mapHeight - y * scaleFactor].join(",")).join(" "))
      .attr("fill", room.shade)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.5)
      .attr("stroke-opacity", 1);

    const centroid = d3.polygonCentroid(room.points.map(([x, y]) => [x * scaleFactor, mapHeight - y * scaleFactor]));
    g.append("text")
      .attr("x", centroid[0])
      .attr("y", centroid[1])
      .attr("fill", "black")
      .attr("opacity", 1)
      .attr("stroke", "blue")
      .attr("stroke-width", 0.1)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("font-family", "Arial")
      .attr("transform", room.name === "Hallway" ? `rotate(-90, ${centroid[0]}, ${centroid[1]})` : null)
      .text('['+room.name+']');
  });
}

// Render furniture
export function renderFurniture(furniture) {
  furniture.forEach(item => {
    const room = floor[0].rooms.find(r => r.id === item.room);
    g.append("polygon")
      .attr("points", item.points.map(([x, y]) => [x * scaleFactor, mapHeight - y * scaleFactor].join(",")).join(" "))
      .attr("fill", room.shade)
      .attr("stroke", "black")
      .attr("stroke-width", 0.2)
      .attr("opacity", 1);
  });
}

// Render nodes
export function renderNodes(nodes) {
  nodes.forEach(item => {
    g.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", item.point[0] * scaleFactor - 5)
      .attr("y", mapHeight - item.point[1] * scaleFactor - 5)
      .attr("fill", "lightred")
      .attr("fill-opacity", 0.4)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("strok-opacity", 1)
      .attr("transform", `rotate(45, ${item.point[0] * scaleFactor}, ${mapHeight - item.point[1] * scaleFactor})`);
  });
}

// Render mmWave sensors as half-circles
export function renderSensors(radarPositions) {
  (Array.isArray(radarPositions) ? radarPositions : Object.values(radarPositions)).forEach(sensor => {
    const position = [sensor.x, sensor.y];
    const startAngle = (sensor.orientation - 120) * (Math.PI / 180);
    const endAngle = (sensor.orientation + 120) * (Math.PI / 180);
    if (position && position.length >= 2) {
      g.append("path")
        .attr("d", d3.arc()({
          innerRadius: 4,
          outerRadius: 10,
          startAngle: startAngle,
          endAngle: endAngle
        }))
        .attr("transform", `translate(${position[0] * scaleFactor}, ${mapHeight - position[1] * scaleFactor})`)
        .attr("fill", "blue")
        .attr("fill-opacity", 0.4)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    } else {
      console.warn('Invalid radar position:', sensor);
    }
  });
}


// Calculate the bounds of a polygon
export function calculatePolygonBounds(polygon) {
  const xExtent = d3.extent(polygon, ([x, _]) => x);
  const yExtent = d3.extent(polygon, ([_, y]) => y);
  return [[xExtent[0], yExtent[0]], [xExtent[1], yExtent[1]]];
}

// Generate button positions within a room
export function generateButtonPositions(room, roomButtons) {
  const positions = [];
  const [[xMin, yMin], [xMax, yMax]] = calculatePolygonBounds(room.points);

  // Room dimensions
  const roomWidth = xMax - xMin;
  const roomHeight = yMax - yMin;

  // Define grid density based on the size of the room
  const roomArea = roomWidth * roomHeight;


  let cols, rows;
  if(room.id === "hallway") {
    cols = 2;
    rows = Math.ceil((roomButtons / 2));
  } else {
    const gridDensity = Math.sqrt(roomArea / roomButtons);
    cols = Math.ceil(roomWidth / gridDensity);
    rows = Math.ceil(roomHeight / gridDensity);

  }

  xStep = roomWidth / cols;
  yStep = roomHeight / rows;

  // Generate dense grid of positions
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = xMin + j * xStep + xStep / 2;
      const y = yMin + i * yStep + yStep / 2;

      // Check if position is within the room polygon and not inside furniture
      if (d3.polygonContains(room.points, [x, y]) && !isInsideFurniture([x, y])) {
        positions.push([x, y]);
      }
    }
  }

  // Trim positions if more buttons than needed
  if (positions.length > roomButtons) {
    return positions.slice(0, roomButtons);
  }

  return positions;
}

function isInsideFurniture(point) {
  return furniture.some(item => d3.polygonContains(item.points, point));
}

function isInsideRoom(point, room) {
  // Validate input
  if (!room || !room.points || !Array.isArray(room.points)) {
    console.log("Room or room points are not properly defined");
    return false;
  }

  // Use d3.polygonContains to check if the point is inside the room
  return d3.polygonContains(room.points, point);
}

export function renderRoomButtons(rooms, buttonCounts) {
  rooms.forEach((room) => {
    const roomButtons = buttonCounts[room.id] || 0;
    const roomPositions = generateButtonPositions(room, roomButtons);

    // Render buttons for this room
    roomPositions.forEach((position) => {
      const [x, y] = position;

      // Append the button (circle)
      g.append("circle")
        .attr("cx", x * scaleFactor)
        .attr("cy", mapHeight - y * scaleFactor)
        .attr("r", 5)
        .attr("fill", "blue")
        .attr("cursor", "pointer")
        .on("click", function () {
          // Log button click
          calculateButtonPosition(position, room);

          // Get row and column counts and distances within the same room
          const { buttonsInRow, buttonsInColumn, distanceToNextInRow, distanceToNextInColumn } =
            searchButtonsOnLine(position, room, roomPositions);

          console.log(
              `- ${buttonsInRow} buttons in the same row, next at ${distanceToNextInRow.toFixed(2)}m.\n` +
              `- ${buttonsInColumn} buttons in the same column, next at ${distanceToNextInColumn.toFixed(2)}m.`
          );

          // Add visual feedback
          d3.select(this)
            .transition()
            .duration(100)
            .attr("fill", "red")
            .attr("r", 8)
            .transition()
            .duration(200)
            .attr("fill", "blue")
            .attr("r", 5);
        });
    });
  });
}



// Updated estimateUserRoom to use x, y coordinates and floor_data
export function estimateUserRoom(x, y) {
  const floor_data = [
    { id: "Office", bounds: [[1.7, 8.99], [7.55, 11.84]] },
    { id: "Kitchen", bounds: [[1.7, 0], [7.55, 5.85]] },
    { id: "Hallway", bounds: [[0, 0], [1.85, 11.84]] },
  ];

  // Iterate through each room and check if the point lies within its bounds
  for (const room of floor_data) {
    const [[xMin, yMin], [xMax, yMax]] = room.bounds;
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
      //console.log(`Estimated User Room: ${room.id}`);
      return room.id; // Return the room ID as soon as a match is found
    }
  }

  console.warn(`Coordinates (${x}, ${y}) are outside known room bounds.`);
  return "Unknown"; // Default if no match is found
}

export function renderRoomButtonsSingle(rooms) {
  rooms.forEach((room) => {
    const [[xMin, yMin], [xMax, yMax]] = calculatePolygonBounds(room.points);

    const offset = -20 / scaleFactor;
    const adjustedXMin = xMin - offset;
    const adjustedYMin = yMin - offset;
    const adjustedXMax = xMax + offset;
    const adjustedYMax = yMax + offset;

    const button = g.append("rect")
      .attr("x", adjustedXMin * scaleFactor)
      .attr("y", mapHeight - adjustedYMax * scaleFactor)
      .attr("width", (adjustedXMax - adjustedXMin) * scaleFactor)
      .attr("height", (adjustedYMax - adjustedYMin) * scaleFactor)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "blue")
      .attr("fill-opacity", 0.3)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("cursor", "pointer")
      .on("click", function () {
        const clickTime = Date.now();

        console.log(`Button clicked in room: ${room.id} at ${clickTime}`);
        console.log("Current BLE:", bleData);

        // Check periodically for valid sensor data
        const intervalId = setInterval(() => {
          const detectedRoom = estimateUserRoom(mmWaveData.x, mmWaveData.y); // Declare detectedRoom
          console.log(`Detected Room: ${detectedRoom || "waiting for valid data"}`);
          console.log("Room ID:", room.id);
          if (detectedRoom === room.id) {
            const sensorTime = Date.now();
            const timeDifference = sensorTime - clickTime;

            const dataToSave = {
              room: detectedRoom,
              time_difference_ms: timeDifference,
              source: "BLE",
            };

            console.log("Saving time difference data:", dataToSave);

            // Send time difference to the server
            fetch("/save_time_difference", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToSave),
            })
              .then((response) => response.json())
              .then((result) =>
                console.log("Time difference saved successfully:", result)
              )
              .catch((error) =>
                console.error("Error saving time difference:", error)
              );

            // Add animation for the button
            button
              .transition()
              .duration(200)
              .attr("fill", "green")
              .transition()
              .duration(200)
              .attr("fill", "blue");

            clearInterval(intervalId); // Stop checking once the data is saved
          }
        }, 50); // Check every 50 ms

        // Add visual feedback for the button click
        d3.select(this)
          .transition()
          .duration(100)
          .attr("fill", "red")
          .transition()
          .duration(200)
          .attr("fill", "blue");
      });
  });
}