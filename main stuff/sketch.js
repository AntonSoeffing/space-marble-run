Matter.use('matter-attractors');

const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Vector = Matter.Vector;

const drawBody = Helpers.drawBody;
const drawSprite = Helpers.drawSprite;

let engine;
let attractor;

let helmet;
let helmetSprite;

let comet;
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

  // create sprites
  cometSprite = new Sprite(cometSpriteData, cometSpriteSheet, 0.075);
  

  // create bodies
  helmet = Bodies.circle(200, 600, helmetSprite.height / 2, {mass: 4});
  comet = Bodies.circle(600, 200, cometSprite.animation[1].height / 4, {angle: 1.25 * Math.PI, mass: 0.25});
  ground = Bodies.rectangle(400, 800, 810, 10, {
    isStatic: true, angle: Math.PI * 0.06
  });

  // add all of the bodies to the world
  World.add(engine.world, [helmet, comet, ground]);

  // run the engine
  Engine.run(engine);
}

function draw() {
  background(space);

  frameRate(60);

  drawSprite(helmet, helmetSprite);

  scrollFollow(helmet)

  fill(128);
  drawBody(ground);

  fill(40);
  drawBody(attractor);

  //fill(70);
  //drawBody(comet);

  Body.setAngle(comet, Vector.angle({x: 0, y: 0}, comet.velocity) + 1.25 * Math.PI)
  cometSprite.draw(comet, cometSprite.animation[1].height / 7, -cometSprite.animation[1].width / 7);
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
