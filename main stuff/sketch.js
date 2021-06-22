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

let helmet;
let helmetSprite;

let meteorite;
let meteoriteSprite;

let ground;

let meteoriteSpriteData;
let meteoriteSpriteSheet;

function preload() {
  // preload images
  helmetSprite = loadImage('sprites/helmet.png');
  space = loadImage('sprites/hintergrund_transparenz.png');
  
  meteoriteSpriteData = loadJSON('sprites/meteorite_data.json');
  meteoriteSpriteSheet = loadImage('sprites/meteorite_sheet.png');

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
  meteoriteSprite = new Sprite(meteoriteSpriteData, meteoriteSpriteSheet, 0.075);
  

  // create bodies
  helmet = Bodies.circle(200, 600, helmetSprite.height / 2, {mass: 4});
  meteorite = Bodies.circle(600, 200, meteoriteSprite.animation[1].height / 4);
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

  frameRate(60);

  drawSprite(helmet, helmetSprite);

  scrollFollow(helmet)

  fill(128);
  drawBody(ground);

  fill(40);
  drawBody(attractor);

  //fill(70);
  //drawBody(meteorite);

  meteoriteSprite.draw(meteorite, meteoriteSprite.animation[1].height / 7, -meteoriteSprite.animation[1].width / 7);
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
