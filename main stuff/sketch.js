Matter.use('matter-attractors');

const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Vector = Matter.Vector;

const drawBody = Helpers.drawBody;
const drawSprite = Helpers.drawSprite;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();

let blackHole;

let helmet;
let helmetSprite;

let cometSprites = [];
let comets = [];
let cometSprite;

let ground;

let cometSpriteData;
let cometSpriteSheet;

function preload() {
  // preload images
  helmetSprite = loadImage('sprites/helmet.png');
  space = loadImage('sprites/hintergrund_transparenz.png');
  
  cometSpriteData = loadJSON('sprites/comet_data.json');
  cometSpriteSheet = loadImage('sprites/comet_sheet.png');

}

function setup() {
  createCanvas(5000, windowHeight);

  engine.gravity.y = 0;

  // Start runner
  Runner.run(runner, engine);

  // Black Hole
  blackHole = Bodies.circle(1600, 1000, 200, {
    isStatic: true,
    plugin: {
      attractors: [
        function(bodyA, bodyB) {
          return {
            x: (bodyA.position.x - bodyB.position.x) * 1e-7,
            y: (bodyA.position.y - bodyB.position.y) * 1e-7,
          };
        }
      ]
    }
  });
  Composite.add(world, blackHole);

  // Helmet
  helmet = Bodies.circle(200, 600, helmetSprite.height / 2, {mass: 4});
  Composite.add(world, helmet);
  
  // Ground
  ground = Bodies.rectangle(400, 800, 810, 10, {
    isStatic: true, angle: Math.PI * 0.06
  });
  Composite.add(world, ground);

  // Comets
  for (let i = 0; i < 5; i++) {
    cometSprites[i] = new Sprite(cometSpriteData, cometSpriteSheet, 0.075);
  }

  for (let i = 0; i < 5; i++) {
  comets[i] = Bodies.circle(random(100, windowWidth), random(0, 800), cometSprites[1].animation[1].height / 4, {angle: 1.25 * Math.PI, mass: 0.25});
  }
  Composite.add(world, comets);
}

function draw() {
  background(space);

  frameRate(60);

  drawSprite(helmet, helmetSprite);

  scrollFollow(helmet)

  fill(128);
  drawBody(ground);

  fill(40);
  drawBody(blackHole);

  for (let i = 0; i < 5; i++) {
    Body.setAngle(comets[i], Vector.angle({x: 0, y: 0}, comets[i].velocity) + 1.25 * Math.PI)
    cometSprites[i].draw(comets[i], cometSprites[i].animation[1].height / 7, -cometSprites[i].animation[1].width / 7);
  }
}

function keyPressed() {
  // is SPACE pressed?
  if (keyCode === 32 && helmet.position.x < 1000) {
    Body.applyForce(helmet,
      {x: helmet.position.x, y: helmet.position.y},
      {x: 0.001, y: 0.015}
    );
  } else {
    Body.applyForce(helmet,
      {x: helmet.position.x, y: helmet.position.y},
      {x: 0.02, y: -0.010}
    );
  }
}

function scrollFollow(matterObj) {
  if (insideViewport(matterObj) == false) {
    const $element = $('html, body');
    if ($element.is(':animated') == false) {
      $element.animate({
        scrollLeft: helmet.position.x,
        scrollTop: helmet.position.y
      }, 1000);
    }
  }
}

function insideViewport(matterObj) {
  const x = matterObj.position.x;
  const y = matterObj.position.y;
  const pageXOffset = window.pageXOffset || document.documentElement.scrollLeft;
  const pageYOffset  = window.pageYOffset || document.documentElement.scrollTop;
  if (x >= pageXOffset && x <= pageXOffset + windowWidth &&
      y >= pageYOffset && y <= pageYOffset + windowHeight) {
    return true;
  } else {
    return false;
  }
}
