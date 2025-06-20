const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const columns = Math.floor(canvas.width / 14);
const drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "14px monospace";

  for (let i = 0; i < drops.length; i++) {
    const digit = Math.floor(Math.random() * 10).toString();
    ctx.fillStyle = Math.random() < 0.5 ? "#ff0044" : "#00aaff";
    ctx.fillText(digit, i * 14, drops[i] * 14);

    if (drops[i] * 14 > canvas.height || Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }

  requestAnimationFrame(drawMatrix);
}

drawMatrix();
