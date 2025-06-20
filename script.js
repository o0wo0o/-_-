// const { Engine, Render, Runner, World, Bodies } = Matter;

// const engine = Engine.create();
// const { world } = engine;

// const render = Render.create({
//   element: document.getElementById('scene-container'),
//   engine: engine,
//   options: {
//     width: 800,
//     height: 600,
//     wireframes: false,
//     background: '#fafafa',
//   }
// });

// Render.run(render);
// Runner.run(Runner.create(), engine);

// // Создаём землю
// const ground = Bodies.rectangle(400, 590, 810, 20, { isStatic: true });
// World.add(world, ground);

// // Добавляем несколько шаров
// for (let i = 0; i < 5; i++) {
//   const ball = Bodies.circle(400 + i * 30, 100, 20, {
//     restitution: 0.8, // прыгучесть
//     render: { fillStyle: '#f78c6b' }
//   });
//   World.add(world, ball);
// }
const canvas = document.getElementById('matrix-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Генерируем массив символов: только цифры
const chars = matrix.range(0x0030, 0x0039);

// Функция для выбора случайного цвета (синий или красный)
function randomColorChar() {
  const char = chars[Math.floor(Math.random() * chars.length)];
  const color = Math.random() < 0.5 ? '#0074D9' : '#FF4136'; // синий или красный
  return { char, color };
}

// Кастомный рендер для цветных символов
const fontSize = 16;
const ctx = canvas.getContext('2d');
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSize + 'px monospace';
  for (let i = 0; i < columns; i++) {
    const { char, color } = randomColorChar();
    ctx.fillStyle = color;
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}
setInterval(draw, 50);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});