export const latestRoom = { room: "Office" };
export const latestPosition = { x: 0, y: 0 };
export let latestMmwaveData = {
  office: { x: 0, y: 0, angle: 0, direction: "", target_count: 0 },
  kitchen: { x: 0, y: 0, angle: 0, directuin: "", target_count: 0 }
};
export const latestHybridPosition = {x: 0, y: 0, room: "Unkown", source: "Unknown"};

export const floor = [
  {
    id: "Office",
    bounds: [[0, 0], [7.55, 11.84]], // Map bounds in meters
    rooms: [
      {
        id: "hallway",
        name: "Hallway",
        shade: "#eeeee4",
        points: [
          [0, 11.84], [1.7, 11.84], [1.7, 11.19], [1.85, 11.19],
          [1.85, 9.68], [1.7, 9.68], [1.7, 5.18], [1.85, 5.18],
          [1.85, 3.67], [1.7, 3.67], [1.7, 2.2], [1.85, 2.2],
          [1.85, 0.69], [1.7, 0.69], [1.7, 0], [0, 0]
        ]
      },
      {
        id: "Office",
        name: "Office",
        shade: "#CBD5C8",
        points: [
          [7.55, 11.84], [7.55, 8.99], [1.7, 8.99], [1.7, 9.68],
          [1.85, 9.68], [1.85, 11.19], [1.7, 11.19], [1.7, 11.84]
        ]
      },
      {
        id: "Kitchen",
        name: "Kitchen",
        shade: "#EBECE6",
        points: [
          [7.55, 5.85], [1.7, 5.85], [1.7, 5.18], [1.85, 5.18],
          [1.85, 3.67], [1.7, 3.67], [1.7, 2.2], [1.85, 2.2],
          [1.85, 0.69], [1.7, 0.69], [1.7, 0], [7.55, 0]
        ]
      }
    ]
  }
];




// Furniture data for the first floor
export const furniture = [
  {
    room: "Kitchen",
    name: "Table",
    points: [
      [4.5, 3.8],
      [6.3, 3.8],
      [6.3, 2.2],
      [4.5, 2.2]
    ]
  },
  {
    room: "Kitchen",
    name: "Table2",
    points: [
      [4.5, 3.8],
      [6.3, 3.8],
      [6.3, 3],
      [4.5,3]
    ]
  },
  {
    room: "Kitchen",
    name: "Sofa",
    points: [
      [6.7, 5.8],
      [6.7, 5],
      [4.3, 5],
      [4.3, 5.8]
      ]
  },
  {
    room: "Kitchen",
    name: "Kitchen_island",
    points: [
      [2, 0.8],
      [5.9, 0.8],
      [5.9, 0.0],
      [2, 0.0]
      ]
  },
  {
    room: "Kitchen",
    name: "Storage",
    points: [
      [6.7, 5.8],
      [7.5, 5.8],
      [7.5, 5.45],
      [6.7, 5.45]
      ]
  },
  {
  room: "Kitchen",
  name: "shelf",
  points: [
      [2.12, 5.8],
      [3.85, 5.8],
      [3.85, 5.4],
      [2.12, 5.4]
    ]
  },
  {
    room: "Kitchen",
    name: "Polygon",
    points: Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * 2 * Math.PI;
      const radius = 0.9/2;
      return [
        6.9 + radius * Math.cos(angle),
        1 + radius * Math.sin(angle)
      ];
    })
  },
  {
    room: "Office",
    name: "Table3",
    points: [
      [3.29, 11.8],
      [6.09, 11.8],
      [6.09, 11.16],
      [3.29, 11.16]
    ]
  },
  {
    room: "Office",
    name: "Table4",
    points: [
      [6.09, 11.8],
      [7.49, 11.8],
      [7.49, 11.16],
      [6.09, 11.16]
    ]
    },
    {
      room: "Office",
      name: "Table5",
      points: [
        [3.29, 11.8],
        [4.59, 11.8],
        [4.59, 11.16],
        [3.29, 11.16]
        ]
    },
    {
      room: "Office",
      name: "Table6",
      points: [
        [5.69, 9.8],
        [7.49, 9.8],
        [7.49, 9],
        [5.69, 9]
        ]
    },
    {
      room: "Office",
      name: "Table7",
      points: [
        [3.89, 9.8],
        [5.69, 9.8],
        [5.69, 9],
        [3.89, 9]
        ]
    }
];

export const nodes = [
  {
    name: "Office_1",
    point: [7.4, 11.5],
  },
  {name: "Office_2",
    point: [1.9, 9.1]
  },
  {
    name: "Hallway_1",
    point: [0.2, 8.2]
  },
  {
    name: "Kit_1",
    point: [1.9, 2.92]
  },
  {
    name: "Kit_2",
    point: [7.3, 0.1]
  }
  ]

// Radar positions and orientations
export const radarPositions = {
  office: { x: 7.45, y: 11.9, orientation: 165 },
  kitchen: { x: 7.45, y: 2.92, orientation: 120 }
};

// List of walls and their orientation
export const walls = [
  {
    room: "hallway",
    points: [[0, 0], [0,11.84]],
    orientation: "west"
  },
  {
    room: "hallway",
    points: [[0, 11.84], [1.7, 11.84]],
    orientation: "north"
  },
  {
    room: "hallway",
    points: [[1.7, 11.84], [1.7, 0]],
    orientation: "east"
  },
  {
    room: "hallway",
    points: [[1.7, 0], [0, 0]],
    orientation: "south"
  },
  {
    room: "Office",
    points: [[1.7, 11.84], [1.7, 8.99]],
    orientation: "west"
  },
  {
    room: "Office",
    points: [[1.7, 11.7], [7.55, 11.7]],
    orientation: "north"
  },
  {
    room: "Office",
    points: [[7.55, 8.99], [7.55, 11.7]],
    orientation: "east"
  },
  {
    room: "Office",
    points: [[7.55, 8.99], [1.7, 8.99]],
    orientation: "south"
  },
  {
    room: "Kitchen",
    points: [[1.7, 0], [1.7, 5.85]],
    orientation: "west"
  },
  {
    room: "Kitchen",
    points: [[1.7, 5.85], [7.55, 5.85]],
    orientation: "north"
  },
  {
    room: "Kitchen",
    points: [[7.55, 5.85], [7.55, 0]],
    orientation: "east"
  },
  {
    room: "Kitchen",
    points: [[7.55, 0], [1.7, 0]],
    orientation: "south"
  }
];

// Function to define wall orientation
export function getWallOrientation([x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "east" : "west";
  } else {
    return dy > 0 ? "north" : "south";
  }
}

// Function to calculate the distance from a point to a line segment
export function distanceToLineSegment([px, py], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return {
    distance: Math.hypot(px - closestX, py - closestY),
    closestPoint: [closestX, closestY],
  };
}

export function calculateButtonPosition(button, room) {
  const [px, py] = button;

  // Filter walls to get only the walls belonging to the current room
  const roomWalls = walls.filter((wall) => wall.room === room.id);

  // Calculate the distance from the button to each wall
  const wallDistances = roomWalls.map(({ points: [start, end], orientation }) => {
    const { distance, closestPoint } = distanceToLineSegment([px, py], start, end);
    return {
      distance,
      closestPoint,
      orientation,
    };
  });

  // Sort walls by distance to find the closest two walls
  wallDistances.sort((a, b) => a.distance - b.distance);

  const closestWall = wallDistances[0];
  const secondClosestWall = wallDistances[1];

  // Log the details for debugging
  console.log(
    `Button at (${px.toFixed(2)}, ${py.toFixed(2)}) in room "${room.name}" is:\n` +
      `- ${closestWall.distance.toFixed(2)}m from the ${closestWall.orientation} wall.\n` +
      `- ${secondClosestWall.distance.toFixed(2)}m from the ${secondClosestWall.orientation} wall.`
  );
}

// Update latest position on the map
export async function fetchLatestPosition() {
  try {
    const response = await fetch('/latest_position');
    const data = await response.json();
    latestPosition.x = data.x;
    latestPosition.y = data.y;
    //console.log(`Updated Position - x: ${latestPosition.x}, y: ${latestPosition.y}`);
  } catch (error) {
    console.error('Error fetching latest position:', error);
  }
}

export async function fetchLatestHybridPosition() {
  try {
    const response = await fetch('/hybrid_position');
    const data = await response.json();

    // Log the full data for debugging
    console.log('Hybrid Position Response:', data);

    // Correctly access nested data
    if (data.room && data.x && data.y) {
      latestHybridPosition.x = data.x;
      latestHybridPosition.y = data.y;
      latestHybridPosition.room = data.room;
      latestHybridPosition.source = data.source;
    }

    // Log updated position and room for debugging
    //console.log('Updated Hybrid Position:', latestHybridPosition.x, latestHybridPosition.y);
    //console.log('Updated Room:', latestHybridPosition.room);
  } catch (error) {
    console.error('Error fetching latest hybrid position:', error);
  }
}


// Update the latest room estimate on the map
export async function fetchLatestRoom() {
  try {
    const response = await fetch('/latest_room');
    const data = await response.json();
    //latestRoom.room = data.room;
    //console.log(`DATA Room: ${latestRoom.room}`);
  } catch (error) {
    console.error('Error fetching latest room:', error);
  }
}

// Update the latest mmWave data
export async function fetchLatestMmwaveData() {
  try {
    const response = await fetch('/latest_mmwave');
    const data = await response.json();
    //console.log(data);
    latestMmwaveData = data;
    //Sconsole.log(`DATA mmWave: ${latestMmwaveData.office.x}`, latestMmwaveData.office.y, latestMmwaveData.office.angle, latestMmwaveData.office.direction, latestMmwaveData.office.target_count);
  } catch (error) {
    console.error('Error fetching latest mmWave data:', error);
  }
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


export function searchButtonsOnLine(position, room, roomPositions) {
  const [x, y] = position;

  // Define a tolerance for floating-point comparisons
  const tolerance = 1e-2;

  // Filter buttons in the same row and column
  const buttonsInRow = roomPositions.filter(([x2, y2]) => Math.abs(y2 - y) <= tolerance && x2 !== x);
  const buttonsInColumn = roomPositions.filter(([x2, y2]) => Math.abs(x2 - x) <= tolerance && y2 !== y);

  // Find the nearest button in the same row
  const nearestInRow = buttonsInRow.reduce(
    (closest, [x2, y2]) => {
      const dist = Math.abs(x2 - x);
      return dist < closest.dist ? { dist, coord: [x2, y2] } : closest;
    },
    { dist: Infinity, coord: null }
  );

  // Find the nearest button in the same column
  const nearestInColumn = buttonsInColumn.reduce(
    (closest, [x2, y2]) => {
      const dist = Math.abs(y2 - y);
      return dist < closest.dist ? { dist, coord: [x2, y2] } : closest;
    },
    { dist: Infinity, coord: null }
  );

  return {
    buttonsInRow: buttonsInRow.length,
    buttonsInColumn: buttonsInColumn.length,
    distanceToNextInRow: nearestInRow.dist,
    distanceToNextInColumn: nearestInColumn.dist,
  };
}

