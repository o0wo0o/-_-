const { Engine, Render, Runner, World, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;

const width = window.innerWidth;
const height = window.innerHeight;

const render = Render.create({
  element: document.getElementById("scene-container"),
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "black",
    pixelRatio: 1,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Глитч-рамка
const frameThickness = 30;
const frameColor = "#00ffff";

const borders = [
  Bodies.rectangle(width / 2, 0, width, frameThickness, {
    isStatic: true,
    render: { fillStyle: frameColor },
  }),
  Bodies.rectangle(width / 2, height, width, frameThickness, {
    isStatic: true,
    render: { fillStyle: frameColor },
  }),
  Bodies.rectangle(0, height / 2, frameThickness, height, {
    isStatic: true,
    render: { fillStyle: frameColor },
  }),
  Bodies.rectangle(width, height / 2, frameThickness, height, {
    isStatic: true,
    render: { fillStyle: frameColor },
  }),
];

World.add(world, borders);

// Земля
const ground = Bodies.rectangle(width / 2, height - 50, width, 20, {
  isStatic: true,
  render: { fillStyle: "#444" },
});
World.add(world, ground);

// Шары
for (let i = 0; i < 15; i++) {
  const ball = Bodies.circle(100 + i * 60, 100, 20, {
    restitution: 0.9,
    render: {
      fillStyle: `hsl(${Math.random() * 360}, 100%, 60%)`,
    },
  });
  World.add(world, ball);
}
