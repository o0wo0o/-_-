const { Engine, Render, Runner, Bodies, World, Body, Events, Svg } = Matter;

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
  container.innerHTML = "";

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "black",
    color: "lime",
    fontFamily: "monospace",
    padding: "20px",
    textAlign: "left",
    zIndex: "5",
    border: "1px solid lime"
  });
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
        line.textContent += link.text[charIndex++];
        setTimeout(typeChar, 60);
      } else {
        line.innerHTML = `<a href="${link.url}" target="_blank" style="color: lime;">${link.text}</a>`;
        done();
      }
    }
    typeChar();
  }

  function nextLink() {
    if (index < links.length) {
      typeLine(links[index++], nextLink);
    }
  }

  nextLink();
}

function splitEye() {
  const svgLeft = document.getElementById("semi-left");
  const svgRight = document.getElementById("semi-right");

  const vertsLeft = Svg.pathToVertices(svgLeft, 30);
  const vertsRight = Svg.pathToVertices(svgRight, 30);

  const halfLeft = Bodies.fromVertices(centerX - 0.5, centerY, vertsLeft, {
    render: {
      fillStyle: "#000000",
      strokeStyle: "#ff0000",
      lineWidth: 4,
      shadowColor: "#ff0000",
      shadowBlur: 40
    }
  });

  const halfRight = Bodies.fromVertices(centerX + 0.5, centerY, vertsRight, {
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

  const startY = centerY - 100;
  const endY = startY + 200 * progress;

  ctx.beginPath();
  ctx.moveTo(centerX, startY);
  ctx.lineTo(centerX, endY);
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
  const dx = mx - centerX;
  const dy = my - centerY;

  if (Math.sqrt(dx * dx + dy * dy) <= 100) {
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

  const intensity = distance < 100 ? (100 - distance) / 100 : 0;
  const shake = intensity ** 2 * 15;

  const x = centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 2 * shake;
  const y = centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 2 * shake;
  Body.setPosition(pupil, { x, y });

  glowTarget = distance < 60 ? 80 : 40;

  if (smileImg) {
    smileImg.style.opacity = (distance <= 100) ? "1" : "0";
  }
});

Events.on(render, "afterRender", () => {
  const ctx = render.context;
  const elapsed = performance.now() - cutEffectStartTime;

  if (cutEffectActive || explosionTriggered) {
    if (cutEffectActive && elapsed <= cutDuration) {
      drawCutLine(Math.min(elapsed / cutDuration, 1));
    }
    if (cutEffectActive && elapsed <= flashDuration) {
      drawFlash(1 - elapsed / flashDuration);
    }
    return;
  }

  pulse += 0.03 * pulseDirection;
  if (pulse > 1 || pulse < 0) {
    pulseDirection *= -1;
    pulse = Math.max(0, Math.min(1, pulse));
  }

  pupil.render.fillStyle = `rgb(${Math.floor(100 + 155 * pulse)},0,0)`;
  glowCurrent += (glowTarget - glowCurrent) * 0.1;
  outerEye.render.shadowBlur = glowCurrent;

  // Дополнительные визуальные эффекты по желанию...
});
