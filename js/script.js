function clamp(
  value,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER
) {
  return Math.max(Math.min(value, max), min);
}

function sample(imageData, row, col) {
  const sampleCol = clamp(col, 0, imageData.width);
  const sampleRow = clamp(row, 0, imageData.height);

  const offset = sampleRow * imageData.width * 4 + sampleCol * 4;
  return [
    imageData.data[offset + 0] / 255,
    imageData.data[offset + 1] / 255,
    imageData.data[offset + 2] / 255,
    imageData.data[offset + 3] / 255,
  ];
}

function setPx(imageData, row, col, val) {
  col = clamp(col, 0, imageData.width);
  row = clamp(row, 0, imageData.height);
  const offset = row * imageData.width * 4 + col * 4;
  return [
    (imageData.data[offset + 0] = val[0] * 255),
    (imageData.data[offset + 1] = val[1] * 255),
    (imageData.data[offset + 2] = val[2] * 255),
    (imageData.data[offset + 3] = val[3] * 255),
  ];
}

function convolute(imageData, kernel) {
  const output = new ImageData(imageData.width, imageData.height);
  const kRowMid = (kernel.length - 1) / 2; //kernels should have odd dimensions
  const kColMid = (kernel[0].length - 1) / 2;

  for (let row = 0; row < imageData.height; row++) {
    for (let col = 0; col < imageData.width; col++) {
      const sum = [0, 0, 0];
      for (let kRow = 0; kRow < kernel.length; kRow++) {
        for (let kCol = 0; kCol < kernel[kRow].length; kCol++) {
          const sampleRow = row + (-kRowMid + kRow);
          const sampleCol = col + (-kColMid + kCol);
          const color = sample(imageData, sampleRow, sampleCol);
          sum[0] += color[0] * kernel[kRow][kCol];
          sum[1] += color[1] * kernel[kRow][kCol];
          sum[2] += color[2] * kernel[kRow][kCol];
        }
      }

      setPx(output, row, col, [...sum, 1.0]);
    }
  }

  return output;
}

async function loadImage(url) {
  return new Promise((r) => {
    let i = new Image();
    i.onload = () => r(i);
    i.src = url;
  });
}

const mycanvas = document.getElementById("mycanvas");
const ctx = mycanvas.getContext("2d");

let img = await loadImage(
  "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp"
);
ctx.drawImage(img, 0, 0);
