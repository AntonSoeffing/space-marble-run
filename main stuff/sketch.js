const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Body = Matter.Body;
const Bodies = Matter.Bodies;

const drawBody = Helpers.drawBody;
const drawSprite = Helpers.drawSprite;

let engine;

let boxA;
let meteorite;
let ground;

function preload() {
  // preload images
  helmetSprite = loadImage('sprites/helmet.png');
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // create an engine
  engine = Engine.create();

  // gravity
  engine.world.gravity.y = 0.5;

  // create two boxes and a ground
  helmet = Bodies.circle(200, 200, helmetSprite.height / 2, helmetSprite.width / 2);
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
  background(0);

  drawSprite(helmet, helmetSprite);

  fill(180);
  drawBody(meteorite)

  fill(128);
  drawBody(ground);
}

function keyPressed() {
  // is SPACE pressed?
  if (keyCode === 32) {
    Body.applyForce(helmet,
      {x: helmet.position.x, y: helmet.position.y},
      {x: 0.015, y: -0.15}
    );
    Body.applyForce(meteorite,
      {x: meteorite.position.x, y: meteorite.position.y},
      {x: -0.1, y: 0.1}
    );
  }
}
