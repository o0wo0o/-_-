const { Engine, Render, Runner, World, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;

const width = 500;
const height = 400;

const render = Render.create({
  element: document.getElementById("scene-container"),
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "#111",
    pixelRatio: 1,
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Земля
const ground = Bodies.rectangle(width / 2, height - 10, width, 20, {
  isStatic: true,
  render: { fillStyle: "#444" }
});
World.add(world, ground);

// Шары
for (let i = 0; i < 6; i++) {
  const ball = Bodies.circle(100 + i * 50, 50, 20, {
    restitution: 0.9,
    render: {
      fillStyle: `hsl(${Math.random() * 360}, 100%, 60%)`
    }
  });
  World.add(world, ball);
}
