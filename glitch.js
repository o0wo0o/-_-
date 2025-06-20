const canvas = document.getElementById("glitch-canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

function glitchLine() {
  const lines = 10;
  for (let i = 0; i < lines; i++) {
    ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)},0,${Math.floor(Math.random() * 255)},0.3)`;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = Math.random() * canvas.width * 0.5;
    const h = 2 + Math.random() * 4;
    ctx.fillRect(x, y, w, h);
  }
}

function animateGlitch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  glitchLine();
  requestAnimationFrame(animateGlitch);
}

animateGlitch();
