"use strict"

class Block {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.build();
  }

  build() {
    const size = 64;
    const x = this.x * 64;
    const y = this.y * 64;
    const z = this.z * 64;

    const block = this.block = $(`<div class="block" />`)
      .css({
        transform: `
          translateX(${x}px)
          translateY(${y}px)
          translateZ(${z}px)
          scale(0.99)
        `
      });

    $(`<div class="x-axis" />`)
      .appendTo(block)
      .css({
        transform: `
          rotateX(90deg)
          rotateY(0deg)
          rotateZ(0deg)
        `
      });

    $(`<div class="y-axis" />`)
      .appendTo(block)
      .css({
        transform: `
          rotateX(0deg)
          rotateY(90deg)
          rotateZ(0deg)
        `
      });

    $(`<div class="z-axis" />`)
      .appendTo(block);
    
    this
      .createFace("top", 0, 0, size / 2, 0, 0, 0)
      .appendTo(block);

    this
      .createFace("side-1", 0, size / 2, 0, 270, 0, 0)
      .appendTo(block);

    this
      .createFace("side-2", size / 2, 0, 0, 0, 90, 0)
      .appendTo(block);

    this
      .createFace("side-3", 0, size / -2, 0, -270, 0, 0)
      .appendTo(block);

    this
      .createFace("side-4", size / -2, 0, 0, 0, -90, 0)
      .appendTo(block);

    this
      .createFace("bottom", 0, 0, size / -2, 0, 180, 0)
      .appendTo(block);
  }

  createFace(type, x, y, z, rx, ry, rz) {
    return $(`<div class="side side-${type}" />`)
      .css({
        transform: `
          translateX(${x}px)
          translateY(${y}px)
          translateZ(${z}px)
          rotateX(${rx}deg)
          rotateY(${ry}deg)
          rotateZ(${rz}deg)
        `,
        background: this.createTexture(type)
      })
      .data("block", this)
      .data("type", type);
  }

  createTexture(type) {
    return `rgba(100, 100, 255, 0.2)`;
  }
}

const DIRT_TEXTURES = {
  "top": [
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-top-1.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-top-2.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-top-3.png"
  ],
  "side": [
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-side-1.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-side-2.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-side-3.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-side-4.png",
    "https://github.com/assertchris-tutorials/tutorial-javascript-minecraft-editor/raw/master/textures/dirt-side-5.png"
  ]
};

class Dirt extends Block {
  createTexture(type) {
    if (type === "top" || type === "bottom") {
      const texture = DIRT_TEXTURES.top.random();

      return `url(${texture})`;
    }

    const texture = DIRT_TEXTURES.side.random();

    return `url(${texture})`;
  }
}

Block.Dirt = Dirt;

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

const $scene = $(".scene");
const $body = $("body");

for (let x = 0; x < 6; x++) {
  for (let y = 0; y < 6; y++) {
    let next = new Block.Dirt(x, y, 0);
    next.block.appendTo($scene);
  }
}

function createCoordinatesFrom(side, x, y, z) {
  if (side == "top") {
    z += 1;
  }

  if (side == "side-1") {
    y += 1;
  }

  if (side == "side-2") {
    x += 1;
  }

  if (side == "side-3") {
    y -= 1;
  }

  if (side == "side-4") {
    x -= 1;
  }

  if (side == "bottom") {
    z -= 1;
  }

  return [x, y, z];
}

$body.on("click", ".side", function(e) {
  const $this = $(this);
  let previous = $this.data("block");

  if ($body.hasClass("subtraction")) {
    previous.block.remove();
    previous = null;
  } else {
    const coordinates = createCoordinatesFrom(
      $this.data("type"),
      previous.x,
      previous.y,
      previous.z
    );

    const next = new Block.Dirt(...coordinates);
    next.block.appendTo($scene);
  }
});

let ghost = null;

function removeGhost() {
  if (ghost) {
    ghost.block.remove();
    ghost = null;
  }
}

function createGhostAt(x, y, z) {
  const next = new Block.Dirt(x, y, z);

  next.block
    .addClass("ghost")
    .appendTo($scene);

  ghost = next;
}

$body.on("mouseenter", ".side", function(e) {
  removeGhost();

  const $this = jQuery(this);
  const previous = $this.data("block");

  const coordinates = createCoordinatesFrom(
    $this.data("type"),
    previous.x,
    previous.y,
    previous.z
  );

  createGhostAt(...coordinates);
});

$body.on("mouseleave", ".side", function(e) {
  removeGhost()
});

let lastMouseX = null;
let lastMouseY = null;

let sceneTransformX = 60;
let sceneTransformY = 0;
let sceneTransformZ = 60;
let sceneTransformScale = 1;

$body.on("mousewheel", function(event) {
  if (event.deltaY > 0) {
    sceneTransformScale -= 0.05;
  } else {
    sceneTransformScale += 0.05;
  }

  changeViewport();
});

Number.prototype.toInt = String.prototype.toInt = function() {
  return parseInt(this, 10);
};

$scene.on("mousedown", function(e) {
  e.stopPropagation();
});

$body.on("mousedown", function(e) {
  lastMouseX = e.clientX / 10;
  lastMouseY = e.clientY / 10;
});

$body.on("mousemove", function(e) {
  if (!lastMouseX) {
    return;
  }

  let nextMouseX = e.clientX / 10;
  let nextMouseY = e.clientY / 10;

  if (nextMouseX !== lastMouseX) {
    let deltaX = nextMouseX.toInt() - lastMouseX.toInt();
    let degrees = sceneTransformZ - deltaX;

    if (degrees > 360) {
        degrees -= 360;
    }

    if (degrees < 0) {
        degrees += 360;
    }

    sceneTransformZ = degrees;
    lastMouseX = nextMouseX;

    changeViewport();
  }

  if (nextMouseY !== lastMouseY) {
    let deltaY = nextMouseY.toInt() - lastMouseY.toInt();
    let degrees = sceneTransformX - deltaY;

    if (degrees > 360) {
        degrees -= 360;
    }

    if (degrees < 0) {
        degrees += 360;
    }

    sceneTransformX = degrees;
    lastMouseY = nextMouseY;

    changeViewport();
  }
});

$body.on("mouseup", function(e) {
  lastMouseX = null;
  lastMouseY = null;
});

function changeViewport() {
  $scene.css({
    "transform": `
      rotateX(${sceneTransformX}deg)
      rotateY(${sceneTransformY}deg)
      rotateZ(${sceneTransformZ}deg)
      scaleX(${sceneTransformScale})
      scaleY(${sceneTransformScale})
      scaleZ(${sceneTransformScale})
    `
  });
};

$body.on("keydown", function(e) {
  if (e.altKey || e.controlKey || e.metaKey) {
    $body.addClass("subtraction");
  }
});

$body.on("keyup", function(e) {
  $body.removeClass("subtraction");
});
