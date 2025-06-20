const { Engine, Render, Runner, Bodies, World, Body } = Matter;

const engine = Engine.create();
const { world } = engine;

const width = 400;
const height = 400;
const centerX = width / 2;
const centerY = height / 2;

const render = Render.create({
  element: document.getElementById("scene-container"),
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: "transparent",
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Внешняя оболочка глаза
const outerEye = Bodies.circle(centerX, centerY, 100, {
  isStatic: true,
  render: {
    fillStyle: "#111",
    strokeStyle: "#ff0000",
    lineWidth: 4
  }
});

// Зрачок
const pupil = Bodies.circle(centerX, centerY, 20, {
  isStatic: true,
  render: {
    fillStyle: "#ff0000"
  }
});

World.add(world, [outerEye, pupil]);

// Движение зрачка за курсором
window.addEventListener("mousemove", (e) => {
  const rect = render.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const dist = Math.min(30, Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx);
  const x = centerX + Math.cos(angle) * dist;
  const y = centerY + Math.sin(angle) * dist;
  Body.setPosition(pupil, { x, y });
});

