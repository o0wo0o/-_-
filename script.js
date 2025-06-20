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

// Полный круг глаза
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

  // Начальная сила движения
  Body.setVelocity(halfLeft, { x: -2, y: 5 });
  Body.setAngularVelocity(halfLeft, -0.2);
  Body.setVelocity(halfRight, { x: 2, y: 5 });
  Body.setAngularVelocity(halfRight, 0.2);

  World.add(world, [halfLeft, halfRight]);

  // Показываем ссылки через 1.2 секунды
  setTimeout(showLinks, 1200);
}

// --- CUT EFFECT BEGIN ---

const cutDuration = 300; // длительность линии разреза в мс
const flashDuration = 150; // длительность вспышки в мс

function drawCutLine(progress) {
  const ctx = render.context;
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - progress)})`;
  ctx.lineWidth = 4;
  ctx.shadowColor = "white";
  ctx.shadowBlur = 20;
  ctx.lineCap = "round";

  // Линия с небольшим наклоном (как разрез мечом)
  const startX = centerX - 80;
  const startY = centerY - 80;
  const endX = startX + 160 * progress;
  const endY = startY + 160 * 0.4 * progress; // 0.4 - наклон линии

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

function animateCutEffect(callback) {
  const start = performance.now();

  function frame(time) {
    const elapsed = time - start;
    const ctx = render.context;

    // Очищаем поверхностно только область линии и вспышки
    ctx.clearRect(0, 0, width, height);

    // Рисуем линию прогрессивно
    if (elapsed <= cutDuration) {
      const progress = Math.min(elapsed / cutDuration, 1);
      drawCutLine(progress);
    }

    // Рисуем вспышку (исчезающую)
    if (elapsed <= flashDuration) {
      const alpha = 1 - elapsed / flashDuration;
      drawFlash(alpha);
    }

    if (elapsed < cutDuration) {
      requestAnimationFrame(frame);
    } else {
      // Очистим контекст после анимации
      ctx.clearRect(0, 0, width, height);
      callback();
    }
  }

  requestAnimationFrame(frame);
}

// --- CUT EFFECT END ---

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

    // Убираем глаз и зрачок только после эффекта
    // Сначала анимация линии и вспышки, потом splitEye
    animateCutEffect(() => {
      World.remove(world, [outerEye, pupil]);
      splitEye();
    });
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
  if (explosionTriggered) return;

  const ctx = render.context;

  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) {
    pulseDirection *= -1;
    pulse = Math.max(0, Math.min(1, pulse));
  }

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
