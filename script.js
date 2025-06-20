// Подключи PolyK.js перед этим скриптом в html!

(() => {
  const {
    Engine,
    Render,
    Runner,
    Bodies,
    World,
    Body,
    Events,
    Composite,
    Vertices,
    Vector,
  } = Matter;

  const engine = Engine.create();
  const { world } = engine;
  const width = 400,
    height = 400;
  const centerX = width / 2,
    centerY = height / 2;

  const render = Render.create({
    element: document.getElementById("scene-container"),
    engine: engine,
    options: { width, height, wireframes: false, background: "transparent" },
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
      shadowBlur: 40,
    },
  });

  const pupil = Bodies.circle(centerX, centerY, 35, {
    isStatic: true,
    render: { fillStyle: "#ff0000" },
  });

  World.add(world, [outerEye, pupil]);

  let pulse = 0,
    pulseDirection = 1;
  let glowTarget = 40,
    glowCurrent = 40;
  let mouseX = centerX,
    mouseY = centerY;

  window.addEventListener("mousemove", (e) => {
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
      { text: "My Blog", url: "https://o0wo0o.github.io/-_/" },
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

  // --- PolyK helper: преобразует тело в плоский массив [x0,y0, x1,y1, ...] для PolyK ---
  function getPolyFromBody(body) {
    let vertices = body.vertices.map((v) => ({ x: v.x, y: v.y }));
    return [].concat(...vertices.map((v) => [v.x, v.y]));
  }

  // Создаёт тело Matter.js из массива вершин
  function createBodyFromVertices(vertices, originalBody) {
    // Центр тела
    var center = Vertices.centre(vertices);

    var newBody = Bodies.fromVertices(
      center.x,
      center.y,
      [vertices],
      {
        render: {
          fillStyle: originalBody.render.fillStyle,
          strokeStyle: originalBody.render.strokeStyle,
          lineWidth: originalBody.render.lineWidth,
          shadowColor: originalBody.render.shadowColor,
          shadowBlur: originalBody.render.shadowBlur,
        },
      },
      true
    );

    return newBody;
  }

  function splitEye() {
    // линия разреза: вертикаль сверху вниз по центру глаза
    const startSlicePoint = { x: centerX, y: centerY - 100 };
    const endSlicePoint = { x: centerX, y: centerY + 100 };

    // получаем полигон глаза в формате PolyK
    let polygon = getPolyFromBody(outerEye);

    if (!PolyK.IsSimple(polygon)) {
      console.warn("Глаз — не простой полигон, разрезать нельзя");
      return;
    }

    // разрезаем полигон по линии
    let newPolygons = PolyK.Slice(
      polygon,
      startSlicePoint.x,
      startSlicePoint.y,
      endSlicePoint.x,
      endSlicePoint.y
    );

    if (newPolygons.length <= 1) {
      console.warn("Разрез не дал результатов");
      return;
    }

    // Создаём тела из новых полигонов
    const newBodies = newPolygons.map((poly) => {
      let verts = [];
      for (let i = 0; i < poly.length; i += 2) {
        verts.push({ x: poly[i], y: poly[i + 1] });
      }
      return createBodyFromVertices(verts, outerEye);
    });

    // Сохраняем скорость и угловую скорость исходного тела (нулевые, т.к. static)
    const originalVelocity = outerEye.velocity;
    const originalAngularVelocity = outerEye.angularVelocity;

    // Удаляем исходное тело
    World.remove(world, outerEye);
    World.remove(world, pupil);

    // Добавляем новые тела
    newBodies.forEach((body, i) => {
      // даём стартовые скорости и вращение для эффекта разлёта
      let direction = i === 0 ? -1 : 1;
      Body.setVelocity(body, { x: direction * 2, y: 5 });
      Body.setAngularVelocity(body, direction * 0.2);

      World.add(world, body);
    });

    // Через 1.2 секунды показываем ссылки
    setTimeout(showLinks, 1200);
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
      splitEye();
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

    if (explosionTriggered) return;

    // Пульсация зрачка
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

    // Хроматическая аберрация
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

    // Раздвоение зрачка
    if (Math.random() < 0.05) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pupil.position.x + 6, pupil.position.y - 6, 35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fill();
      ctx.restore();
    }

    // TV-полосы
    if (Math.random() < 0.05) {
      for (let i = 0; i < 5; i++) {
        const y = Math.random() * render.canvas.height;
        ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
        ctx.fillRect(0, y, render.canvas.width, 2);
      }
    }

    // Глитч-полосы
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
})();
