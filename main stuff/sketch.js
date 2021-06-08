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
  helmSprite = loadImage('helm2.png');

  // create an engine
  engine = Engine.create();

  // gravity
  engine.world.gravity.y = 0.5;

  // create two boxes and a ground
  boxA = Bodies.rectangle(200, 200, 80, 80);
  comet = Bodies.circle(800, 40, 20);
  ground = Bodies.rectangle(400, 800, 810, 10, {
    isStatic: true, angle: Math.PI * 0.06
  });

  // add all of the bodies to the world
  World.add(engine.world, [boxA, comet, ground]);

  // run the engine
  Engine.run(engine);
}

function draw() {
  background(0);

  drawSprite(boxA, helmSprite);

  fill(180);
  drawBody(comet)

  fill(128);
  drawBody(ground);
}

function keyPressed() {
  // is SPACE pressed?
  if (keyCode === 32) {
    Body.applyForce(boxA,
      {x: boxA.position.x, y: boxA.position.y},
      {x: 0.015, y: -0.15}
    );
    Body.applyForce(comet,
      {x: comet.position.x, y: comet.position.y},
      {x: -0.1, y: 0.1}
    );
  }
}
