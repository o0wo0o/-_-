const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const columns = Math.floor(canvas.width / 14);
const drops = Array(columns).fill(1);

let isExplosion = false;

function drawMatrix() {
  ctx.fillStyle = isExplosion ? "rgba(0, 0, 0, 0.03)" : "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "14px monospace";

  for (let i = 0; i < drops.length; i++) {
    const digit = Math.floor(Math.random() * 10).toString();
    ctx.fillStyle = isExplosion
      ? `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.5)`
      : (Math.random() < 0.5 ? "rgba(255, 51, 102, 1)" : "rgba(51, 204, 255, 1)");
    ctx.fillText(digit, i * 14, drops[i] * 14);

    if (drops[i] * 14 > canvas.height || Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }

  requestAnimationFrame(drawMatrix);
}

drawMatrix();

window.setMatrixExplosion = function () {
  isExplosion = true;
};
