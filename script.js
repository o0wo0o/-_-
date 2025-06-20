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
    fillStyle: "#000000",
    strokeStyle: "#ff0000",
    lineWidth: 4,
    shadowColor: "#ff0000",
    shadowBlur: 40
  }
});

// Увеличенный зрачок
const pupil = Bodies.circle(centerX, centerY, 35, {
  isStatic: true,
  render: {
    fillStyle: "#ff0000"
  }
});

World.add(world, [outerEye, pupil]);

// Анимационные параметры
let pulse = 0;
let pulseDirection = 1;
let glowTarget = 40;
let glowCurrent = 40;

let mouseX = centerX;
let mouseY = centerY;

// Обновляем позицию мыши
window.addEventListener("mousemove", (e) => {
  const rect = render.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

// Положение зрачка с постоянной тряской
Events.on(engine, "beforeUpdate", () => {
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const dist = Math.min(30, distance);
  const angle = Math.atan2(dy, dx);

  // Базовая тряска всегда + усиливается при приближении
  const baseShake = 2; // всегда
  const proximityShake = Math.max(0, (60 - distance) / 60) * 6; // до +6
  const shakeAmount = baseShake + proximityShake;

  const shakeX = (Math.random() - 0.5) * 2 * shakeAmount;
  const shakeY = (Math.random() - 0.5) * 2 * shakeAmount;

  const x = centerX + Math.cos(angle) * dist + shakeX;
  const y = centerY + Math.sin(angle) * dist + shakeY;

  Body.setPosition(pupil, { x, y });

  // Адаптивное свечение
  glowTarget = distance < 60 ? 80 : 40;
});

// Отображение и эффекты
Events.on(render, "afterRender", () => {
  const ctx = render.context;

  // Пульсация зрачка
  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) {
    pulseDirection *= -1;
    pulse = Math.max(0, Math.min(1, pulse));
  }
  const red = Math.floor(100 + 155 * pulse);
  pupil.render.fillStyle = `rgb(${red},0,0)`;

  // Плавное изменение свечения
  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;

  // Вертикальная чёрная линия в зрачке
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(pupil.position.x, pupil.position.y - 20);
  ctx.lineTo(pupil.position.x, pupil.position.y + 20);
  ctx.stroke();
  ctx.restore();
});
