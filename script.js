const { Engine, Render, Runner, Bodies, World, Body, Events, Composite, Vertices, Vector } = Matter;

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

let explosionTriggered = false;

// Глаз
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

function showLinks() {
  const container = document.getElementById("scene-container");
  container.innerHTML = "";

  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.top = "50%";
  box.style.left = "50%";
  box.style.transform = "translate(-50%, -50%)";
  box.style.background = "black";
  box.style.color = "lime";
  box.style.fontFamily = "monospace";
  box.style.padding = "20px";
  box.style.textAlign = "left";
  box.style.zIndex = "5";
  box.style.border = "1px solid lime";
  container.appendChild(box);

  const links = [
    { text: "Hack The Box", url: "https://app.hackthebox.com/profile/1159833" },
    { text: "GitHub", url: "https://github.com/o0wo0o" },
    { text: "My Blog", url: "https://o0wo0o.github.io/-_/" }
  ];

  let index = 0;

  function typeLine(link, done) {
    let charIndex = 0;
    const line = document.createElement("div");
    box.appendChild(line);

    function typeChar() {
      if (charIndex < link.text.length) {
        line.textContent += link.text[charIndex];
        charIndex++;
        setTimeout(typeChar, 60);
      } else {
        line.innerHTML = `<a href='${link.url}' target='_blank' style='color: lime;'>${link.text}</a>`;
        done();
      }
    }
    typeChar();
  }

  function nextLink() {
    if (index < links.length) {
      typeLine(links[index], () => {
        index++;
        setTimeout(nextLink, 300);
      });
    }
  }

  nextLink();
}

function splitEye() {
  const halfLeft = Bodies.trapezoid(centerX - 50, centerY, 100, 200, 0.5, {
    render: {
      fillStyle: "#000000",
      strokeStyle: "#ff0000",
      lineWidth: 4,
      shadowColor: "#ff0000",
      shadowBlur: 40
    }
  });

  const halfRight = Bodies.trapezoid(centerX + 50, centerY, 100, 200, 0.5, {
    render: {
      fillStyle: "#000000",
      strokeStyle: "#ff0000",
      lineWidth: 4,
      shadowColor: "#ff0000",
      shadowBlur: 40
    }
  });

  Body.setVelocity(halfLeft, { x: -2, y: 5 });
  Body.setAngularVelocity(halfLeft, -0.2);
  Body.setVelocity(halfRight, { x: 2, y: 5 });
  Body.setAngularVelocity(halfRight, 0.2);

  World.add(world, [halfLeft, halfRight]);

  setTimeout(showLinks, 1200);
}

// --- Эффекты линии разреза и вспышки ---

const cutDuration = 300; // длительность линии разреза, мс
const flashDuration = 150; // длительность вспышки, мс
let cutEffectActive = false;
let cutEffectStartTime = 0;

function drawCutLine(progress) {
  const ctx = render.context;
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - progress)})`;
  ctx.lineWidth = 4;
  ctx.shadowColor = "white";
  ctx.shadowBlur = 20;
  ctx.lineCap = "round";

  const startX = centerX - 80;
  const startY = centerY - 80;
  const endX = startX + 160 * progress;
  const endY = startY + 160 * 0.4 * progress;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.restore();
}

function drawFlash(alpha) {
  const ctx = render.context;
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

render.canvas.addEventListener("click", (e) => {
  if (explosionTriggered) return;

  const rect = render.canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const dx = mx - centerX;
  const dy = my - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= 100) {
    explosionTriggered = true;

    cutEffectActive = true;
    cutEffectStartTime = performance.now();

    setTimeout(() => {
      World.remove(world, [outerEye, pupil]);
      splitEye();
      cutEffectActive = false;
    }, cutDuration + 50);
  }
});

Events.on(engine, "beforeUpdate", () => {
  if (explosionTriggered) return;

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
});

Events.on(render, "afterRender", () => {
  const ctx = render.context;

  if (cutEffectActive) {
    const elapsed = performance.now() - cutEffectStartTime;

    if (elapsed <= cutDuration) {
      const progress = Math.min(elapsed / cutDuration, 1);
      drawCutLine(progress);
    }

    if (elapsed <= flashDuration) {
      const alpha = 1 - elapsed / flashDuration;
      drawFlash(alpha);
    }

    if (elapsed > cutDuration) {
      cutEffectActive = false;
    }
    return; // во время эффекта линии и вспышки не рисуем остальные эффекты
  }

  // Пульсация зрачка
  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) {
    pulseDirection *= -1;
    pulse = Math.max(0, Math.min(1, pulse));
  }
  const red = Math.floor(100 + 155 * pulse);
  pupil.render.fillStyle = `rgb(${red},0,0)`;

  // Мягкая тень
  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;

  // Вертикальная линия зрачка
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.moveTo(pupil.position.x, pupil.position.y - 20);
  ctx.lineTo(pupil.position.x, pupil.position.y + 20);
  ctx.stroke();
  ctx.restore();

  // Глитч-эффекты

  // 1. Красно-синие смещённые контуры зрачка (хроматическая аберрация)
  ctx.save();
  const offset = 1 + Math.random() * 2;
  ctx.beginPath();
  ctx.arc(pupil.position.x + offset, pupil.position.y, 35, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,0,0,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pupil.position.x - offset, pupil.position.y, 35, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,255,255,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 2. Раздвоение зрачка
  if (Math.random() < 0.05) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pupil.position.x + 6, pupil.position.y - 6, 35, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fill();
    ctx.restore();
  }

  // 3. TV-линии
  if (Math.random() < 0.05) {
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * render.canvas.height;
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fillRect(0, y, render.canvas.width, 2);
    }
  }

  // 4. Пиксельные искажения (глитч-полосы)
  if (Math.random() < 0.03) {
    for (let i = 0; i < 2; i++) {
      const y = Math.random() * render.canvas.height;
      const w = render.canvas.width;
      const h = 5 + Math.random() * 5;
      const imgData = ctx.getImageData(0, y, w, h);
      const dx = Math.random() * 10 - 5;
      ctx.putImageData(imgData, dx, y);
    }
  }
});
