const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

// get the real camera source
function getVideo() {
  // setting media constraints: only need video
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    // resolve
    .then(localMediaStream => {
      // return the object which the source of the media
      video.srcObject = localMediaStream;
      video.play();
    })
    // reject
    .catch(err => {
      console.err(`Deny the webcam permission`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  // repeatedly calls a function, with a fixed time delay between each call
  // continuously obtain current video information
  return setInterval(() => {
    // draw an image onto the canvas
    // Draw the lens image from(0, 0) of the canvas with width and height
    ctx.drawImage(video, 0, 0, width, height);

    let pixels = ctx.getImageData(0, 0, width, height);

    // try some effects
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);
    // pixels = greenScreen(pixels);

    // paints ImageData object onto the canvas
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();

  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "photo");
  link.innerHTML = `<img src="${data}" alt="photo" />`;
  strip.insertBefore(link, strip.firsChild);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) { // (r,g,b,a)
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // Red+
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // Green-
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue-
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) { // (r,g,b,a)
    pixels.data[i - 150] = pixels.data[i + 0]; // Red
    pixels.data[i + 500] = pixels.data[i + 1]; // Green
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i += 4) { // (r,g,b,a)
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin) {
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);