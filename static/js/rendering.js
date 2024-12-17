import { calculateButtonPosition, searchButtonsOnLine } from "./data.js";
import { floor, furniture, nodes, } from "./data.js";
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
      .attr("x", item.point[0] * scaleFactor)
      .attr("y", mapHeight - item.point[1] * scaleFactor)
      .attr("fill", "green")
      .attr("fill-opacity", 0.4)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("strok-opacity", 1)
      .attr("transform", `rotate(45, ${item.point[0] * scaleFactor}, ${mapHeight - item.point[1] * scaleFactor})`);
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
