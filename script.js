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

let explosionTriggered = false;

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

// ⬇️ Получаем DOM-картинку
const smileImg = document.querySelector(".smile");

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
    { text: "Notes", url: "https://o0wo0o.github.io/-_/" }
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
  const halfLeft = Bodies.rectangle(centerX - 50, centerY, 153, 81, {
    chamfer: { radius: [80, 80, 0, 0] },
    render: {
      fillStyle: "#000000",
      strokeStyle: "#ff0000",
      lineWidth: 4,
      shadowColor: "#ffffff",
      shadowBlur: 60
    }
  });

  const halfRight = Bodies.rectangle(centerX + 50, centerY, 153, 81, {
    chamfer: { radius: [80, 80, 0, 0] },
    render: {
      fillStyle: "#000000",
      strokeStyle: "#ff0000",
      lineWidth: 4,
      shadowColor: "#ffffff",
      shadowBlur: 60
    }
  });

  Body.setVelocity(halfLeft, { x: -2, y: 5 });
  Body.setAngularVelocity(halfLeft, -0.3);
  Body.setVelocity(halfRight, { x: 2, y: 5 });
  Body.setAngularVelocity(halfRight, 0.3);

  World.add(world, [halfLeft, halfRight]);

 
  setTimeout(() => {
    window.setMatrixExplosion(); // смена цвета в matrix.js
  }, 300);

  setTimeout(showLinks, 1800);
}

const cutDuration = 300;
const flashDuration = 150;
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

  const startX = centerX;
  const startY = centerY - 100;
  const endX = centerX;
  const endY = startY + 200 * progress;

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

  // ➕ Плавное появление картинки
  if (smileImg) {
    const opacity = (distance <= 100) ? "1" : "0";
    smileImg.style.opacity = opacity;
  }
});

Events.on(render, "afterRender", () => {
  const ctx = render.context;

  const now = performance.now();
  const elapsed = now - cutEffectStartTime;

  if (cutEffectActive || explosionTriggered) {
    if (cutEffectActive && elapsed <= cutDuration) {
      const progress = Math.min(elapsed / cutDuration, 1);
      drawCutLine(progress);
    }

    if (cutEffectActive && elapsed <= flashDuration) {
      const alpha = 1 - elapsed / flashDuration;
      drawFlash(alpha);
    }

    return;
  }

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

  const offset = 1 + Math.random() * 2;
  ctx.save();
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

  if (Math.random() < 0.05) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pupil.position.x + 6, pupil.position.y - 6, 35, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fill();
    ctx.restore();
  }

  if (Math.random() < 0.05) {
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * render.canvas.height;
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fillRect(0, y, render.canvas.width, 2);
    }
  }

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
