const { Engine, Render, Runner, Bodies, World, Body, Events, Vertices } = Matter;

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
const smileImg = document.querySelector(".smile");

window.addEventListener("mousemove", e => {
  const rect = render.canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function showLinks() {
  const container = document.getElementById("scene-container");
  container.innerHTML = `<img src='images.png' class='smile' />`;
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
        line.textContent += link.text[charIndex++];
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
      typeLine(links[index++], () => setTimeout(nextLink, 300));
    }
  }
  nextLink();
}

function splitEye() {
  const radius = 100;
  const numPoints = 50;
  const left = [], right = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = Math.PI * (i / numPoints);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    left.push([x, y]);
  }
  for (let i = 0; i <= numPoints; i++) {
    const angle = Math.PI * (1 - i / numPoints);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle);
    right.push([x, y]);
  }

  const leftBody = Bodies.fromVertices(centerX, centerY, [left], {
    render: outerEye.render
  }, true);

  const rightBody = Bodies.fromVertices(centerX, centerY, [right], {
    render: outerEye.render
  }, true);

  Body.setVelocity(leftBody, { x: -2, y: 5 });
  Body.setAngularVelocity(leftBody, -0.2);
  Body.setVelocity(rightBody, { x: 2, y: 5 });
  Body.setAngularVelocity(rightBody, 0.2);

  World.add(world, [leftBody, rightBody]);
  setTimeout(showLinks, 1200);
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
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 100);
  ctx.lineTo(centerX, centerY + 100 * progress * 2);
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

render.canvas.addEventListener("click", e => {
  if (explosionTriggered) return;
  const rect = render.canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const dist = Math.hypot(mx - centerX, my - centerY);
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
  const shake = distance < 100 ? ((100 - distance) / 100) ** 2 * 15 : 0;
  const x = centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 2 * shake;
  const y = centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 2 * shake;
  Body.setPosition(pupil, { x, y });
  glowTarget = distance < 60 ? 80 : 40;
  if (smileImg) smileImg.style.opacity = distance <= 100 ? "1" : "0";
});

Events.on(render, "afterRender", () => {
  const ctx = render.context;
  const elapsed = performance.now() - cutEffectStartTime;
  if (cutEffectActive && elapsed <= cutDuration) drawCutLine(elapsed / cutDuration);
  if (cutEffectActive && elapsed <= flashDuration) drawFlash(1 - elapsed / flashDuration);
  if (cutEffectActive || explosionTriggered) return;
  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) pulseDirection *= -1;
  pulse = Math.max(0, Math.min(1, pulse));
  pupil.render.fillStyle = `rgb(${Math.floor(100 + 155 * pulse)},0,0)`;
  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;
});
