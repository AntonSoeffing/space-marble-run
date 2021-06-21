Matter.use('matter-attractors');

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Body = Matter.Body;
const Bodies = Matter.Bodies;

const drawBody = Helpers.drawBody;
const drawSprite = Helpers.drawSprite;

let engine;
let attractor;

let boxA;
let meteorite;
let ground;

function preload() {
  // preload images
  helmetSprite = loadImage('sprites/helmet.png');
  space = loadImage('sprites/hintergrund_transparenz.png');
}

function setup() {
  createCanvas(5000, windowHeight);

  // create an engine
  engine = Engine.create();

  // gravity
  engine.world.gravity.y = 0;

  attractor = Bodies.circle(1600, 1000, 200, {
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
  World.add(engine.world, attractor);

  // create two boxes and a ground
  helmet = Bodies.circle(200, 600, helmetSprite.height / 2, {mass: 4});
  meteorite = Bodies.circle(800, 40, 20);
  ground = Bodies.rectangle(400, 800, 810, 10, {
    isStatic: true, angle: Math.PI * 0.06
  });

  // add all of the bodies to the world
  World.add(engine.world, [helmet, meteorite, ground]);

  // run the engine
  Engine.run(engine);
}

function draw() {
  background(space);

  drawSprite(helmet, helmetSprite);

  scrollFollow(helmet)

  fill(180);
  drawBody(meteorite)

  fill(128);
  drawBody(ground);

  fill(40);
  drawBody(attractor)
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
