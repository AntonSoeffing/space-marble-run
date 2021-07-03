Matter.use('matter-attractors');

const Engine = Matter.Engine;
const Runner = Matter.Runner;
const Composite = Matter.Composite;
const Composites = Matter.Composites;
const Constraint = Matter.Constraint;
const Body = Matter.Body;
const Bodies = Matter.Bodies;
const Vector = Matter.Vector;
const Events = Matter.Events;

const drawBody = Helpers.drawBody;
const drawBodies = Helpers.drawBodies;
const drawSprite = Helpers.drawSprite;
const drawConstraints = Helpers.drawConstraints;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();

let blackHole;

let spaceObjects = [];

let helmet;
let helmetSprite;

let cometSpriteData;
let cometSpriteSheet;

let reverse = false;

function preload() {
  // Preload images
  // Mars Background
  marsSprite = loadImage('sprites/backgrounds/mars/mars.png');

  // Space Background Elements
  planetSprite = loadImage('sprites/backgrounds/space/planet.png');
  starSprite = loadImage('sprites/backgrounds/space/star_3.png');

  // Helmet
  helmetSprite = loadImage('sprites/helmet.png');

  // Comets
  cometSpriteData = loadJSON('sprites/comet_data.json');
  cometSpriteSheet = loadImage('sprites/comet_sheet.png');
}

function setup() {
  createCanvas(windowWidth * 2, windowHeight);

  engine.gravity.y = 0;

  // Start Runner
  Runner.run(runner, engine);

  // Backgrounds
  spaceBackground = new Background('space', 50, 200);
  marsBackground = new Background('mars');

  // ----- SPACE -----
  // Black Hole
  blackHole = Bodies.circle(1600, 1000, 200, {
    label: 'blackHole',
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
  helmetBody = Bodies.circle(200, 600, helmetSprite.height / 2, {mass: 4});
  Composite.add(world, helmetBody);
  helmet = new Helmet(helmetBody, helmetSprite);
  spaceObjects.push(helmet);
  
  // Comets
  let spaceObjectsCount = 5;

  for (let i = 0; i < spaceObjectsCount; i++) {
    let sprite = new Sprite(cometSpriteData, cometSpriteSheet, 0.075);
    let body = Bodies.circle(random(100, windowWidth), random(0, 800), sprite.animation[0].height / 4, {angle: 1.25 * Math.PI, mass: 0.25});
    spaceObjects.push(new Comet(body, sprite));

    Composite.add(world, body);
  }

  Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      let objectToRemove;
      if (bodyB == blackHole && bodyA !== blackHole) {
        objectToRemove = bodyA;
      } else if (bodyA == blackHole && bodyB !== blackHole) {
        objectToRemove = bodyB;
      }
      if (objectToRemove) {
        Matter.World.remove(world, objectToRemove);

        for (let i = 0; i < spaceObjects.length; i++) {
          if (spaceObjects[i].body == objectToRemove) {
            spaceObjects.splice(i, 1);
            break;
          }          
        }
      }
    });
  });

  // ----- MARS -----
  // Mars ground
  marsGround = Bodies.rectangle(windowWidth * 1.5, 870, windowWidth, 20, {isStatic: true})
  Composite.add(world, marsGround);

  // Bridge
  const group = Body.nextGroup(true);
  const rects = Composites.stack(3200, 750, 10, 1, 10, 10, function(x, y) {
      return Bodies.rectangle(x, y, 50, 20, { collisionFilter: { group: group } });
  });
  bridge = Composites.chain(rects, 0.5, 0, -0.5, 0, {stiffness: 0.8, length: 2, render: {type: 'line'}});
  Composite.add(world, [bridge]);

  // left and right fix point of bridge
  Composite.add(rects, Constraint.create({
    pointA: {x: 3200, y: 750},
    bodyB: rects.bodies[0],
    pointB: {x: -25, y: 0},
    stiffness: 0.1
  }));
  Composite.add(rects, Constraint.create({
    pointA: {x: 3800, y: 750},
    bodyB: rects.bodies[rects.bodies.length-1],
    pointB: {x: +25, y: 0},
    stiffness: 0.02
  }));

  // Stack of blocks
  blockStack = Composites.stack(2800, 570, 3, 20, 3, 3, function(x, y) {
    return Bodies.rectangle(x, y, 20, 20);
  });

  // Platform
  platform = Bodies.rectangle(3300, 550, 200, 30, {isStatic: true});
  Composite.add(world, platform);
}

function draw() {
  frameRate(60);

  if (engine.gravity.y == 1) {
    marsBackground.draw();
  } else {
    spaceBackground.draw();
  }

  scrollFollow(helmet.body);

  // ----- SPACE -----
  drawBody(blackHole);

  for (let i = 0; i < spaceObjects.length; i++) {
    if (spaceObjects[i] instanceof Comet) {
      // Comet
      Body.setAngle(spaceObjects[i].body, Vector.angle({x: 0, y: 0}, spaceObjects[i].body.velocity) + 1.25 * Math.PI)
      spaceObjects[i].sprite.draw(spaceObjects[i].body, spaceObjects[i].sprite.animation[0].height / 7, -spaceObjects[i].sprite.animation[0].width / 7);
    } else if (spaceObjects[i] instanceof Helmet) {
      // Helmet
      drawSprite(spaceObjects[i].body, spaceObjects[i].sprite)
    }
  }

  // ----- MARS -----
  //Platform logic
  fill(250);

  if(reverse == false && platform.position.x < 4000) {
    Body.translate(platform, {x: +2, y: 0})
  } else if (platform.position.x == 4000 && reverse == false) {
    reverse = true;
  } else if (reverse == true && platform.position.x > 3300) {
    Body.translate(platform, {x: -2, y: 0})
  } else if (platform.position.x == 3300 && reverse == true) {
    reverse = false;
  }
  drawBody(platform);

  let onPlatform = Matter.SAT.collides(helmet.body, platform);

  if(onPlatform.collided && reverse == false) {
    Body.translate(helmet.body,{x: 2, y: 0});
  } else if (onPlatform.collided && reverse == true) {
    Body.translate(helmet.body,{x: -2, y: 0});
  }

  fill(40);

  drawBodies(bridge.bodies);
  drawConstraints(bridge.constraints);
  drawBodies(blockStack.bodies);
}

function keyPressed() {
  // is SPACE pressed?
  if (keyCode === 32 && engine.gravity.y == 0) {
    Body.setVelocity(helmet.body,
      {x: 5.25, y: -0.5}
    );
    // Tell p5.js to prevent default behavior on Spacebar press (scrolling)
    return(false);
  } else {
    Body.applyForce(helmet.body,
      {x: helmet.body.position.x, y: helmet.body.position.y},
      {x: 0.03, y: -0.1}
    );
  }
}

function marsLanding() {
  engine.gravity.y = 1;
  Composite.remove(world, blackHole)
  Composite.add(world, blockStack);
}

function scrollFollow(matterObj) {
  if (insideViewport(matterObj) == false) {
    const $element = $('html, body');
    if ($element.is(':animated') == false) {
      $element.animate({
        scrollLeft: helmet.body.position.x,
        scrollTop: helmet.body.position.y
      }, 1000);
      marsLanding()
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
