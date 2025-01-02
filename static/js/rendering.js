import { calculateButtonPosition, searchButtonsOnLine } from "./data.js";
import { floor, furniture, nodes, radarPositions, fetchLatestPosition,latestPosition, fetchLatestRoom, latestRoom, fetchLatestMmwaveData, latestMmwaveData, fetchLatestHybridPosition, latestHybridPosition } from "./data.js";
import { g } from "./map.js";


// Config and scaling
const width = window.innerWidth;
const height = window.innerHeight;
const scaleFactor = 50;
let  yStep;
let  xStep;
let hue = 0;


// Calculate the map's size in pixels
const mapWidth = (floor[0].bounds[1][0] - floor[0].bounds[0][0]) * scaleFactor;
const mapHeight = (floor[0].bounds[1][1] - floor[0].bounds[0][1]) * scaleFactor;

// Periodically fetch and update position and room name
export function startPositionUpdates(mapHeight) {
  setInterval(async () => {
    await fetchLatestRoom();
    await fetchLatestPosition();
    await fetchLatestMmwaveData();
    await fetchLatestHybridPosition();
    calculateMmwaveGlobalCoordinates(mapHeight);
    await syncMmwaveDataToBackend();
     // Calculate mmWave global coordinates
    renderHybridPosition(mapHeight); // Update hybrid position
    //updateLatestPosition(mapHeight); // Update position and room name
    //renderMmwaveSensors(mapHeight); // Update mmWave sensor readings
  }, 200);
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
    .then((data) => console.log('Server')) // Log server response
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
export function updateLatestPosition(mapHeight) {
  let positionDot = g.select(".latest-position-dot");
  let roomText = g.select(".latest-room-text");

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
    .attr("cx", latestPosition.x * scaleFactor)
    .attr("cy", mapHeight - latestPosition.y * scaleFactor);

  // Update the room name position and text
  roomText
    .attr("x", latestPosition.x * scaleFactor)
    .attr("y", mapHeight - latestPosition.y * scaleFactor - 10)
    .text(latestRoom.room);
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

    if (!data || !radar || (data.x === 0 && data.y === 0) || data.target_count === 0) {
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

    //console.log(`Sensor: ${sensor}, Global X: ${globalX.toFixed(2)}, Global Y: ${globalY.toFixed(2)}`);
  });

 // console.log("Processed latestMmwaveData:", latestMmwaveData);
}




/**
 * Render mmWave sensors using precomputed global coordinates.
 * @param {Object} mapHeight - The height of the map for coordinate inversion.
 */
export function renderMmwaveSensors(mapHeight) {
  const sensors = Object.keys(latestMmwaveData);

  // Map sensor data to renderable objects, with validation
  const sensorData = sensors
    .map((sensor) => {
      const data = latestMmwaveData[sensor];
      if (!data || typeof data.globalX !== "number" || typeof data.globalY !== "number") {
        return null;
      }
      //console.log("Scaled:",data.globalX * scaleFactor, (mapHeight - data.globalY) * scaleFactor);
      return {
        id: sensor,
        x: data.globalX,
        y: data.globalY, // Already a
      };
    })
    .filter(Boolean); // Remove null or invalid entries


  // Bind data to circles
  const circles = g.selectAll(".sensor-circle").data(sensorData, (d) => d.id);

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

  // Remove circles not in the current data
  circles.exit().remove();
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


export function renderRoomButtonsSingle(rooms) {
  rooms.forEach((room) => {
    const [[xMin, yMin], [xMax, yMax]] = calculatePolygonBounds(room.points);

    // Apply offset of 15 to the room points
    const offset = -20 / scaleFactor;
    const adjustedXMin = xMin - offset;
    const adjustedYMin = yMin - offset;
    const adjustedXMax = xMax + offset;
    const adjustedYMax = yMax + offset;


    // Append the button (rectangle with rounded corners)
    g.append("rect")
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
      .on("click", async function () {
        const mmWaveData = Object.values(latestMmwaveData).find(
          (sensor) => sensor.target_count > 0
        );

        let dataToSave;

        if (mmWaveData) {
          dataToSave = {
            source: "mmWave",
            room: room.id,
            x: latestHybridPosition.x,
            y: latestHybridPosition.y,
          };
        } else {
          dataToSave = {
            source: "BLE",
            room: room.id,
            x: latestPosition.x,
            y: latestPosition.y,
          };
        }

        console.log("Saving data:", dataToSave);

        try {
          const response = await fetch("/save_data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSave),
          });

          const result = await response.json();
          console.log("Data saved successfully:", result);
        } catch (error) {
          console.error("Error saving data:", error);
        }

        // Add visual feedback
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