const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

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

// Круглый глаз
const outerEye = Bodies.circle(centerX, centerY, 100, {
  isStatic: true,
  render: {
    fillStyle: "#000000",       // Чёрный глаз
    strokeStyle: "#ff0000",     // Ярко-красная обводка
    lineWidth: 4,
    shadowColor: "#ff0000",     // Тень
    shadowBlur: 40
  }
});

// Красный зрачок
const pupil = Bodies.circle(centerX, centerY, 20, {
  isStatic: true,
  render: {
    fillStyle: "#ff0000"        // Ярко-красный зрачок
  }
});

World.add(world, [outerEye, pupil]);

// Зрачок следует за мышью
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

// Чёрная вертикальная линия в зрачке
Events.on(render, "afterRender", () => {
  const ctx = render.context;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(pupil.position.x, pupil.position.y - 15);
  ctx.lineTo(pupil.position.x, pupil.position.y + 15);
  ctx.stroke();
  ctx.restore();
});
