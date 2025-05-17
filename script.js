const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

const psiSlider = document.getElementById("psiSlider");
const psiValue = document.getElementById("psiValue");
const bounceHeights = document.getElementById("bounceHeights").children;
const startBtn = document.getElementById("startBtn");
const heightScale = document.getElementById("heightScale");

const g = 9.81;
const ballDiameterM = 0.246; // NBA basketball in meters
let animationId;

const ballImage = new Image();
ballImage.src =
  "https://upload.wikimedia.org/wikipedia/commons/7/7a/Basketball.png";

let pixelPerMeter;

function updateCanvasSize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  pixelPerMeter = canvas.height / 2.2; // fits ~2.2m vertical space
  updateHeightScale();
}

function updateHeightScale() {
  const labels = [2, 1.5, 1, 0.5, 0];
  heightScale.innerHTML = "";
  labels.forEach((val) => {
    const div = document.createElement("div");
    div.textContent = `${val}m`;
    heightScale.appendChild(div);
  });
}

function psiToCOR(psi) {
  // Velocity-based COR, square root of height ratio
  const minCOR = Math.sqrt(0.15); // ~0.387 at 2 PSI
  const maxCOR = Math.sqrt(0.7); // ~0.837 at 8.5 PSI

  const t = (psi - 2) / (8.5 - 2); // normalized [0,1]
  return minCOR + t * (maxCOR - minCOR);
}
  

function drawBall(y) {
  const pixelDiameter = ballDiameterM * pixelPerMeter;
  const x = canvas.width / 2 - pixelDiameter / 2;
  ctx.drawImage(ballImage, x, y, pixelDiameter, pixelDiameter);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 1; i <= 5; i++) {
    bounceHeights[i].textContent = `${i}: —`;
  }
}

function runSimulation() {
  const psi = parseFloat(psiSlider.value);
  const cor = psiToCOR(psi);

  let velocity = 0;
  let y = canvas.height - ballDiameterM * pixelPerMeter - 1.1 * pixelPerMeter;
  let bounceCount = 0;
  let prevTime = null;
  let bouncing = true;

  function step(timestamp) {
    if (!prevTime) prevTime = timestamp;
    const dt = (timestamp - prevTime) / 1000;
    prevTime = timestamp;

    velocity += g * dt;
    y += velocity * dt * pixelPerMeter;

    const bottomY = canvas.height - ballDiameterM * pixelPerMeter;

    if (y >= bottomY) {
      y = bottomY;

      if (Math.abs(velocity) < 0.5) {
        bouncing = false;
      }

      if (bounceCount < 5) {
        const h = (velocity * velocity) / (2 * g);
        bounceHeights[bounceCount + 1].textContent = `${
          bounceCount + 1
        }: ${h.toFixed(2)}m`;
      }

      velocity = -velocity * cor;
      bounceCount++;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall(y);

    if (bouncing && bounceCount < 10) {
      animationId = requestAnimationFrame(step);
    }
  }

  drawBall(y);
  animationId = requestAnimationFrame(step);
}

psiSlider.addEventListener("input", () => {
  psiValue.textContent = psiSlider.value;
});

function updateSliderFill() {
  const val =
    ((psiSlider.value - psiSlider.min) / (psiSlider.max - psiSlider.min)) * 100;
  psiSlider.style.background = `linear-gradient(to right, #f5f5dc 0%, #f5f5dc ${val}%, #444 ${val}%, #444 100%)`;
}

psiSlider.addEventListener("input", () => {
  psiValue.textContent = psiSlider.value;
  updateSliderFill();
});

window.addEventListener("load", updateSliderFill);

startBtn.addEventListener("click", () => {
  cancelAnimationFrame(animationId);
  clearCanvas();
  runSimulation();
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationId);
  updateCanvasSize();
  clearCanvas();
  drawBall(canvas.height - ballDiameterM * pixelPerMeter);
});

ballImage.onload = () => {
  updateCanvasSize();
  drawBall(canvas.height - ballDiameterM * pixelPerMeter);
};
