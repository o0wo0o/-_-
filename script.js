const { Engine, Render, Runner, Bodies, World, Body, Events } = Matter;

const engine = Engine.create();
const { world } = engine;
const width = 400, height = 400;
const centerX = width / 2, centerY = height / 2;

const render = Render.create({
  element: document.getElementById("scene-container"),
  engine: engine,
  options: { width, height, wireframes: false, background: "transparent" }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const outerEye = Bodies.circle(centerX, centerY, 100, {
  isStatic: true,
  render: {
    fillStyle: "#000000",
    strokeStyle: "#ff0000",
    lineWidth: 4,
    shadowColor: "#ff0000",
    shadowBlur: 40
  }
});

const pupil = Bodies.circle(centerX, centerY, 35, {
  isStatic: true,
  render: { fillStyle: "#ff0000" }
});

World.add(world, [outerEye, pupil]);

let pulse = 0, pulseDirection = 1;
let glowTarget = 40, glowCurrent = 40;
let mouseX = centerX, mouseY = centerY;

window.addEventListener("mousemove", e => {
  const rect = render.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

Events.on(engine, "beforeUpdate", () => {
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.hypot(dx, dy);
  const dist = Math.min(30, distance);
  const angle = Math.atan2(dy, dx);

  let shake = 0;
  if (distance < 100) {
    const intensity = (100 - distance) / 100;
    shake = intensity ** 2 * 15;
  }
  const shakeX = (Math.random() - 0.5) * 2 * shake;
  const shakeY = (Math.random() - 0.5) * 2 * shake;

  const x = centerX + Math.cos(angle) * dist + shakeX;
  const y = centerY + Math.sin(angle) * dist + shakeY;
  Body.setPosition(pupil, { x, y });

  glowTarget = distance < 60 ? 80 : 40;

  document.querySelectorAll(".smile").forEach(smile => {
    smile.style.opacity = distance < 80 ? "1" : "0";
  });
});

Events.on(render, "afterRender", () => {
  const ctx = render.context;
  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) { pulseDirection *= -1; pulse = Math.max(0, Math.min(1, pulse)); }
  const red = Math.floor(100 + 155 * pulse);
  pupil.render.fillStyle = `rgb(${red},0,0)`;

  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;

  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(pupil.position.x, pupil.position.y - 20);
  ctx.lineTo(pupil.position.x, pupil.position.y + 20);
  ctx.stroke();
  ctx.restore();
});
