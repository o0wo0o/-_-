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

// === Глаз ===
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

// === Зрачок ===
const pupil = Bodies.circle(centerX, centerY, 20, {
  isStatic: true,
  render: {
    fillStyle: "#ff0000"
  }
});

World.add(world, [outerEye, pupil]);

// === Веко для моргания ===
let blinkY = 0;
let blinking = false;
let blinkTimer = 0;

// === Пульсация цвета зрачка ===
let pulse = 0;
let pulseDirection = 1;

// === Световое усиление при наведении ===
let glowTarget = 40;
let glowCurrent = 40;

// === Мышь ===
let mouseX = centerX;
let mouseY = centerY;

window.addEventListener("mousemove", (e) => {
  const rect = render.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const dist = Math.min(30, Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx);
  const x = centerX + Math.cos(angle) * dist;
  const y = centerY + Math.sin(angle) * dist;
  Body.setPosition(pupil, { x, y });

  // Увеличим свечение если мышь близко
  const d = Math.sqrt(dx * dx + dy * dy);
  glowTarget = d < 60 ? 80 : 40;
});

// === Рендер-после обработки ===
Events.on(render, "afterRender", () => {
  const ctx = render.context;

  // 1. Моргание (анимация века)
  if (!blinking && Math.random() < 0.005) {
    blinking = true;
    blinkTimer = 0;
  }
  if (blinking) {
    blinkTimer += 0.1;
    blinkY = Math.sin(blinkTimer) * 100;
    if (blinkTimer > Math.PI) {
      blinking = false;
      blinkY = 0;
    }

    ctx.save();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 110, blinkY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Пульсация цвета зрачка
  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) {
    pulseDirection *= -1;
    pulse = Math.max(0, Math.min(1, pulse));
  }
  const red = Math.floor(100 + 155 * pulse);
  pupil.render.fillStyle = `rgb(${red},0,0)`;

  // 3. Увеличение/уменьшение свечения
  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;

  // 4. Зрачковая вертикальная линия
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(pupil.position.x, pupil.position.y - 15);
  ctx.lineTo(pupil.position.x, pupil.position.y + 15);
  ctx.stroke();
  ctx.restore();
});
