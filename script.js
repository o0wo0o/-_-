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

// Сплюснутый глаз (эллипс)
const outerEye = Matter.Bodies.fromVertices(centerX, centerY, [
  Array.from({ length: 60 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 60;
    const x = Math.cos(angle) * 100; // ширина
    const y = Math.sin(angle) * 60;  // высота
    return { x, y };
  })
], {
  isStatic: true,
  render: {
    fillStyle: "#111",
    strokeStyle: "#ff0000",
    lineWidth: 4
  }
}, true);

// Красный зрачок
const pupil = Bodies.circle(centerX, centerY, 20, {
  isStatic: true,
  render: {
    fillStyle: "#ff0000"
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

// Добавим вертикальную чёрную линию в центр зрачка
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
