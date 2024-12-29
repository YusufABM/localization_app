import { calculateButtonPosition, searchButtonsOnLine } from "./data.js";
import { floor, furniture, nodes, radarPositions, fetchLatestPosition,latestPosition, fetchLatestRoom, latestRoom, fetchLatestMmwaveData, latestMmwaveData } from "./data.js";
import { g } from "./map.js";


// Config and scaling
const width = window.innerWidth;
const height = window.innerHeight;
const scaleFactor = 50;
let  yStep;
let  xStep;

// Calculate the map's size in pixels
const mapWidth = (floor[0].bounds[1][0] - floor[0].bounds[0][0]) * scaleFactor;
const mapHeight = (floor[0].bounds[1][1] - floor[0].bounds[0][1]) * scaleFactor;

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
    .attr("y", mapHeight - latestPosition.y * scaleFactor - 10) // Position above the dot
    .text(latestRoom.room);
}

// Periodically fetch and update position and room name
export function startPositionUpdates(mapHeight) {
  setInterval(async () => {
    //await fetchLatestRoom();
    //await fetchLatestPosition();
    await fetchLatestMmwaveData();
    updateLatestPosition(mapHeight); // Update position and room name
    renderMmwaveSensors(); // Update mmWave sensor readings
  }, 200);
}

// Function to render mmWave sensor readings
export function renderMmwaveSensors() {
  const sensors = Object.keys(latestMmwaveData);
  sensors.forEach(sensor => {
    const data = latestMmwaveData[sensor];
    const radar = radarPositions[sensor];

    if (!data || !radar) {
      console.warn(`No data or radar position for sensor: ${sensor}`);
      return;
    }

    // Correct distance calculation
    const distance = Math.sqrt(data.x ** 2 + data.y ** 2) / 1000; // Convert to meters

    // Adjust angle based on direction and radar orientation
    let adjustedAngle = data.angle;
    if (data.direction === 'Left') {
      adjustedAngle -= radar.orientation; // Adjust for radar's mounting angle
    } else if (data.direction === 'Right') {
      adjustedAngle += radar.orientation; // Adjust for radar's mounting angle
    } // 'Middle' keeps the angle as is

    const angleInRadians = adjustedAngle * (Math.PI / 180);

    // Calculate global x and y based on radar position, distance, and corrected angle
    const calculatedX = radar.x + distance * Math.cos(angleInRadians);
    const calculatedY = radar.y + distance * Math.sin(angleInRadians);

    // Debugging output
    console.log(`Sensor: ${sensor}, Distance: ${distance.toFixed(2)} meters, X: ${calculatedX.toFixed(2)} meters, Y: ${calculatedY.toFixed(2)} meters`);

    // Render the calculated position as a circle
    g.append("circle")
      .attr("cx", calculatedX * scaleFactor)
      .attr("cy", mapHeight - calculatedY * scaleFactor)
      .attr("r", 5)
      .attr("fill", "red")
      .attr("fill-opacity", 0.6)
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    /* Render a line from the radar to the calculated position
    g.append("line")
      .attr("x1", radar.x * scaleFactor)
      .attr("y1", mapHeight - radar.y * scaleFactor)
      .attr("x2", calculatedX * scaleFactor)
      .attr("y2", mapHeight - calculatedY * scaleFactor)
      .attr("stroke", "red")
      .attr("stroke-width", 2);*/
  });
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
  radarPositions.forEach(sensor => {
    const position = sensor.position;
    if (position && position.length >= 2) {
      g.append("path")
        .attr("d", d3.arc()({
          innerRadius: 4,
          outerRadius: 10,
          startAngle: Math.PI,
          endAngle: -Math.PI
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
