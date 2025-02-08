let prevMouseIsPressed = false;
let indicatorObj = null;

function setup() {
  createCanvas(600, 600);
  background(220);
  indicatorObj = new Point();
}

function draw() {
  // rect(0, 0, mouseX, mouseY);

  if (mouseIsPressed) {
    if (!prevMouseIsPressed) {
      indicatorObj.captureOffset();
    }
  } else {
    if (prevMouseIsPressed) {
      indicatorObj.persistOffset();
    }
  }

  background(220);
  indicatorObj.draw();

  prevMouseIsPressed = mouseIsPressed;
}

class Point {
  constructor() {
    this.radius = 30;
    this.x = width / 2;
    this.y = height / 2;
    this.offsetX = 0;
    this.offsetY = 0;
    this.capturedMouseX = 0;
    this.capturedMouseY = 0;
  }

  draw() {
    if (mouseIsPressed) {
      this.offsetX = mouseX - this.capturedMouseX;
      this.offsetY = mouseY - this.capturedMouseY;
    }
    circle(this.x + this.offsetX, this.y + this.offsetY, this.radius);
  }

  captureOffset() {
    this.capturedMouseX = mouseX;
    this.capturedMouseY = mouseY;
  }

  persistOffset() {
    this.x += this.offsetX;
    this.y += this.offsetY;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}
