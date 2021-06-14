const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Body = Matter.Body;
const Bodies = Matter.Bodies;

const drawBody = Helpers.drawBody;
const drawSprite = Helpers.drawSprite;

let engine;

let boxA;
let comet;
let ground;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //images
  helmetSprite = loadImage('sprites/helmet.png');

  // create an engine
  engine = Engine.create();

  // gravity
  engine.world.gravity.y = 0.5;

  // create two boxes and a ground
  helmet = Bodies.rectangle(200, 200, 80, 80);
  comet = Bodies.circle(800, 40, 20);
  ground = Bodies.rectangle(400, 800, 810, 10, {
    isStatic: true, angle: Math.PI * 0.06
  });

  // add all of the bodies to the world
  World.add(engine.world, [helmet, comet, ground]);

  // run the engine
  Engine.run(engine);
}

function draw() {
  background(0);

  drawSprite(helmet, helmetSprite);

  fill(180);
  drawBody(comet)

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
    Body.applyForce(comet,
      {x: comet.position.x, y: comet.position.y},
      {x: -0.1, y: 0.1}
    );
  }
}
