let prevMouseIsPressed = false;
let indicatorObj = null;
let offsetCaptured = false;

function setup() {
  createCanvas(600, 600);
  background(220);
  indicatorObj = new Point();
}

function draw() {
  if (mouseIsPressed) {
    if (!prevMouseIsPressed && !offsetCaptured) {
      indicatorObj.captureOffset();
      // offsetCaptured = true;
    }
  } else {
    if (prevMouseIsPressed && !offsetCaptured) {
      indicatorObj.persistOffset();
    }
  }

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
      background(220);

      this.offsetX = mouseX - this.capturedMouseX;
      this.offsetY = mouseY - this.capturedMouseY;

      const circleX = this.x + this.offsetX;
      const circleY = this.y + this.offsetY;

      circle(circleX, circleY, this.radius);

      push();
      fill("green");
      textAlign(CENTER, CENTER);
      text(
        `Local: (${circleX - mouseX}, ${circleY - mouseY})`,
        circleX,
        circleY + textSize()
      );
      text(
        `World: (${circleX}, ${circleY})`,
        circleX,
        circleY + 2 * textSize()
      );
      pop();

      push();
      fill("red");
      circle(mouseX, mouseY, 10);
      textAlign(CENTER, CENTER);
      text("Local: (0, 0)", mouseX, mouseY - textSize());
      text(`World: (${mouseX}, ${mouseY})`, mouseX, mouseY - 2 * textSize());
      pop();

      push();
      stroke("blue");
      line(circleX, circleY, mouseX, circleY);
      line(circleX, mouseY, mouseX, mouseY);
      line(circleX, circleY, circleX, mouseY);
      line(mouseX, circleY, mouseX, mouseY);
      pop();
    }
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
