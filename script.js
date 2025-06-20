const { Engine, Render, Runner, World, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;

const render = Render.create({
  element: document.getElementById('scene-container'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#fafafa',
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Создаём землю
const ground = Bodies.rectangle(400, 590, 810, 20, { isStatic: true });
World.add(world, ground);

// Добавляем несколько шаров
for (let i = 0; i < 5; i++) {
  const ball = Bodies.circle(400 + i * 30, 100, 20, {
    restitution: 0.8, // прыгучесть
    render: { fillStyle: '#f78c6b' }
  });
  World.add(world, ball);
}