
// Import data from data.js
import { floor, furniture, nodes, } from "./data.js";
import { calculateButtonPosition, searchButtonsOnLine } from "./data.js";
import { renderBounds, renderFurniture, renderRooms, renderNodes, renderRoomButtons } from "./rendering.js";

// Config and scaling
const width = window.innerWidth;
const height = window.innerHeight;
const scaleFactor = 50;

// Calculate the map's size in pixels
const mapWidth = (floor[0].bounds[1][0] - floor[0].bounds[0][0]) * scaleFactor;
const mapHeight = (floor[0].bounds[1][1] - floor[0].bounds[0][1]) * scaleFactor;

// Initial transform to center the map
const centerX = (width - mapWidth) / 2;
const centerY = (height - mapHeight) / 2;

const buttonCounts = {
  hallway: 18,
  Office: 32,
  Kitchen: 64
};


// Select the container and append the SVG
const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background-color", "#ffffff");


// Append a group for the map content with initial transform
export const g = svg.append("g")
  .attr("transform", `translate(${centerX}, ${centerY})`);

// Apply initial transform to center the map
const initialTransform = d3.zoomIdentity.translate(centerX, centerY);
g.attr("transform", initialTransform);

// Set up zoom and pan
const zoom = d3.zoom()
  .scaleExtent([0.5, 4])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });



// Render the map for the first floor
renderBounds(floor[0].bounds);
renderFurniture(furniture);
renderRooms(floor[0].rooms);
renderNodes(nodes);

// Render buttons for each room
renderRoomButtons(floor[0].rooms, buttonCounts);

// Apply the initial transform to the zoom behavior
svg.call(zoom.transform, initialTransform);
svg.call(zoom);
