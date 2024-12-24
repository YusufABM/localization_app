

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
      [4.5, 3.8], // top-left
      [6.3, 3.8], // top-right
      [6.3, 2.2], // bottom-left
      [4.5, 2.2]  // bottom-right
    ]
  },
  {
    room: "Kitchen",
    name: "Table2",
    points: [
      [4.5, 3.8], // top-left
      [6.3, 3.8], // top-right
      [6.3, 3], // bottom-left
      [4.5,3]  // bottom-right
    ]
  },
  {
    room: "Kitchen",
    name: "Sofa",
    points: [
      [6.7, 5.8], // top-left
      [6.7, 5], // top-right
      [4.3, 5], // bottom-right
      [4.3, 5.8]  // bottom-left
    ]
  },
  {
    room: "Kitchen",
    name: "Kitchen_island",
    points: [
      [2, 0.8], // top-left
      [5.9, 0.8], // top-right
      [5.9, 0.0], // bottom-right
      [2, 0.0]  // bottom-left
    ]
  },
  {
    room: "Kitchen",
    name: "Storage",
    points: [
      [6.7, 5.8], // top-left
      [7.5, 5.8], // top-right
      [7.5, 5.45], // bottom-right
      [6.7, 5.45]  // bottom-left
    ]
  },
  {
  room: "Kitchen",
  name: "shelf",
  points: [
      [2.12, 5.8], // top-left
      [3.85, 5.8], // top-right
      [3.85, 5.4], // bottom-right
      [2.12, 5.4]  // bottom-left
  ]
  },
  {
    room: "Kitchen",
    name: "Polygon",
    points: Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * 2 * Math.PI;
      const radius = 0.9/2; // diameter / 2
      return [
        6.9 + radius * Math.cos(angle), // x coordinate
        1 + radius * Math.sin(angle)    // y coordinate
      ];
    })
  },
  {
    room: "Office",
    name: "Table3",
    points: [
      [3.29, 11.8], // top-left
      [6.09, 11.8], // top-right
      [6.09, 11.16], // bottom-right
      [3.29, 11.16]  // bottom-left
    ]
  },
  {
    room: "Office",
    name: "Table4",
    points: [
      [6.09, 11.8], // top-left
      [7.49, 11.8], // top-right
      [7.49, 11.16], // bottom-right
      [6.09, 11.16]  // bottom-left
    ]
    },
    {
      room: "Office",
      name: "Table5",
      points: [
        [3.29, 11.8], // top-left
        [4.59, 11.8], // top-right
        [4.59, 11.16], // bottom-right
        [3.29, 11.16]  // bottom-left
      ]
    },
    {
      room: "Office",
      name: "Table6",
      points: [
        [5.69, 9.8], // top-left
        [7.49, 9.8], // top-right
        [7.49, 9], // bottom-right
        [5.69, 9]  // bottom-left
      ]
    },
    {
      room: "Office",
      name: "Table7",
      points: [
        [3.89, 9.8], // top-left
        [5.69, 9.8], // top-right
        [5.69, 9], // bottom-right
        [3.89, 9]  // bottom-left
      ]
    }
];

export const nodes = [
  {
    name: "Office_1",
    point: [7.2, 11.5],
  },
  {name: "Office_2",
    point: [1.9, 9.3]
  },
  {
    name: "Hallway_1",
    point: [0.1, 11.4]
  },
  {
    name: "Kit_1",
    point: [2.1, 3.6]
  },
  {
    name: "Kit_2",
    point: [7.2, 0.5]
  }
  ]


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

