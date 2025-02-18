// Initialize grid on page load
document.addEventListener("DOMContentLoaded", () => {
  createGrid(3);
});

// Handle image upload
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = document.getElementById("inputImage");
    img.src = event.target.result;
    img.style.display = "block";
    document.getElementById("outputImage").style.display = "none";
  };
  reader.readAsDataURL(file);
});

// Create filter grid
function createGrid(size) {
  const grid = document.getElementById("filterGrid");
  grid.innerHTML = "";
  const n = parseInt(size) || 3;
  const center = Math.floor((n - 1) / 2);

  for (let i = 0; i < n; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < n; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.value = i === center && j === center ? 1 : 0;
      input.step = "0.1";
      cell.appendChild(input);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

// Apply filter to image
function applyFilter() {
  const inputImg = document.getElementById("inputImage");
  if (!inputImg.src) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = inputImg.naturalWidth;
  canvas.height = inputImg.naturalHeight;
  ctx.drawImage(inputImg, 0, 0);

  const inputData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const outputData = new ImageData(canvas.width, canvas.height);

  // Get filter values
  const filter = [];
  const rows = document.querySelectorAll("#filterGrid tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("input");
    const rowValues = [];
    cells.forEach((cell) => rowValues.push(parseFloat(cell.value) || 0));
    filter.push(rowValues);
  });

  const n = filter.length;
  if (n === 0) return;
  const radius = Math.floor(n / 2);
  const divisor = filter.flat().reduce((sum, val) => sum + val, 0) || 1;

  // Apply convolution
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const fx = Math.min(Math.max(x + j - radius, 0), canvas.width - 1);
          const fy = Math.min(Math.max(y + i - radius, 0), canvas.height - 1);
          const pixelIndex = (fy * canvas.width + fx) * 4;
          const weight = filter[i][j];

          r += inputData.data[pixelIndex] * weight;
          g += inputData.data[pixelIndex + 1] * weight;
          b += inputData.data[pixelIndex + 2] * weight;
        }
      }

      const outputIndex = (y * canvas.width + x) * 4;
      outputData.data[outputIndex] = Math.max(0, Math.min(255, r / divisor));
      outputData.data[outputIndex + 1] = Math.max(
        0,
        Math.min(255, g / divisor)
      );
      outputData.data[outputIndex + 2] = Math.max(
        0,
        Math.min(255, b / divisor)
      );
      outputData.data[outputIndex + 3] = 255;
    }
  }

  // Display output image
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext("2d");
  outputCtx.putImageData(outputData, 0, 0);

  const outputImg = document.getElementById("outputImage");
  outputImg.src = outputCanvas.toDataURL();
  outputImg.style.display = "block";
}
