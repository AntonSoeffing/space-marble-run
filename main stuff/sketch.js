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
let blackHoleSprite;

let spaceObjects = [];

let helmet;
let helmetSprite;

let cometSpriteData;
let cometSpriteSheet;

let satelliteSprite;

let planetSprite;
let moonSprite;
let star0Sprite;
let star1Sprite;
let star2Sprite;
let marsSprite;

let platforms = [];
let platformCount = 5;
let platformXCord;
let platformYCord = 780;
let onPlatform;
let reverseOdd = false;
let reverseEven = false;

let wallXCord = 3100;

let projectiles = []
let projectilesCount = 50;
let projectileNumber = 0;
let shootingEnemy = false;

function preload() {
  // Preload images
  // Mars Background
  marsSprite = loadImage('sprites/backgrounds/mars/mars.png');

  // Space Background Elements
  planetSprite = loadImage('sprites/backgrounds/space/planet.png');
  moonSprite = loadImage('sprites/backgrounds/space/moon.png');
  star0Sprite = loadImage('sprites/backgrounds/space/star_0.png');
  star1Sprite = loadImage('sprites/backgrounds/space/star_1.png');
  star2Sprite = loadImage('sprites/backgrounds/space/star_2.png');

  // Black Hole
  blackHoleSprite = loadImage('sprites/blackHole.png');

  // Helmet
  helmetSprite = loadImage('sprites/helmet.png');

  // Comets
  cometSpriteData = loadJSON('sprites/comet_data.json');
  cometSpriteSheet = loadImage('sprites/comet_sheet.png');
  // Satellite
  satelliteSprite = loadImage('sprites/satellite.png');

  // Ufo
  ufoSprite = loadImage('sprites/Ufo.png')
}

function setup() {
  createCanvas(windowWidth * 4, windowHeight);

  engine.gravity.y = 0;

  // Start Runner
  Runner.run(runner, engine);

  // Backgrounds
  spaceBackground = new Background('space', 60, 200);
  marsBackground = new Background('mars');

  // ----- SPACE -----
  // Black Hole
  blackHole = Bodies.circle(windowWidth * 0.6, windowHeight * 0.9, 20, {
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
            spawnDebris(random(0, windowWidth), random(- windowHeight * 0.2, 0));
            break;
          }
        }
      }
    });
  });

  // ----- MARS -----
  // Mars ground
  marsGround = Bodies.rectangle(windowWidth * 1.5 , 870, windowWidth, 20, {isStatic: true})
  Composite.add(world, marsGround);

  marsGround2 = Bodies.rectangle(windowWidth * 2.5 , 870, windowWidth, 20, {isStatic: true})
  Composite.add(world, marsGround2);

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
  blockStack = Composites.stack(5800, 570, 3, 20, 3, 3, function(x, y) {
    return Bodies.rectangle(x, y, 20, 20);
  });

  // Platforms
  for (let i = 0; i < platformCount; i++) {
    if (i % 2 == 0) {
      platformXCord = 2600;
    } else {
      platformXCord = 3000;
    }
    platforms[i] = Bodies.rectangle(platformXCord, platformYCord, 150, 15 , {isStatic: true});
    platformYCord -= 100
  }
  Composite.add(world, platforms);

  //Wall
  obstacleWall = Bodies.rectangle(wallXCord, 590 , 20, 550, {isStatic: true})
  Composite.add(world, obstacleWall);

  //Ramp
  ramp = Bodies.fromVertices(wallXCord-110 , 850, [{ x: 3000, y: 870}, { x: 2700, y: 870 }, { x: 3000, y: 830 }])
  Composite.add(world, ramp);

  //UFO
  ufo = Bodies.circle(windowWidth*2.5, 150, 50, {isStatic: true});
  Composite.add(world, ufo);

  for (let i = 0; i < projectilesCount; i++) {
    projectiles[i] = Bodies.circle(windowWidth * 2.5, 200, 5, {isStatic: true, mass: 4})
  }
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
  drawSprite(blackHole, blackHoleSprite);

  for (let i = 0; i < spaceObjects.length; i++) {
    if (spaceObjects[i] instanceof Comet) {
      // Comet
      Body.setAngle(spaceObjects[i].body, Vector.angle({x: 0, y: 0}, spaceObjects[i].body.velocity) + 1.25 * Math.PI);
      spaceObjects[i].sprite.draw(spaceObjects[i].body, spaceObjects[i].sprite.animation[0].height / 7, -spaceObjects[i].sprite.animation[0].width / 7);
    } else if (spaceObjects[i] instanceof Satellite) {
      // Satellite
      drawSprite(spaceObjects[i].body, spaceObjects[i].sprite);
      //Matter.Body.rotate(spaceObjects[i].body, 0.05);
    } else if (spaceObjects[i] instanceof Helmet) {
      // Helmet
      drawSprite(spaceObjects[i].body, spaceObjects[i].sprite);
    }
  }

  // ----- MARS -----
  //Platform logic
  fill(250);

  let countingUp = [0,1,2,3,4]

  countingUp.forEach(countingUp => {
    if(countingUp % 2 == 0 && reverseEven == false && platforms[0].position.x < 3000) {
      Body.translate(platforms[countingUp], {x: +2, y: 0})
    } else if (countingUp % 2 == 0 && reverseEven == true && platforms[0].position.x > 2600) {
      Body.translate(platforms[countingUp], {x: -2, y: 0})
    } else if (countingUp % 2 != 0 && reverseOdd == false && platforms[1].position.x < 3000) {
      Body.translate(platforms[countingUp], {x: +2, y: 0})
    } else if (countingUp % 2 != 0 && reverseOdd == true && platforms[1].position.x > 2600) {
      Body.translate(platforms[countingUp], {x: -2, y: 0})
    } else if (platforms[0].position.x == 3000) {
      reverseEven = true;
    } else if (platforms[0].position.x == 2600) {
      reverseEven = false;
    } else if (platforms[1].position.x == 3000) {
      reverseOdd = true;
    } else if (platforms[1].position.x == 2600) {
      reverseOdd = false;
    }

    onPlatform = Matter.SAT.collides(helmetBody, platforms[countingUp]);

    if(countingUp % 2 == 0 && onPlatform.collided && reverseEven == false) {
      Body.translate(helmetBody,{x: 2, y: 0});
    } else if (countingUp % 2 == 0 && onPlatform.collided && reverseEven == true) {
      Body.translate(helmetBody,{x: -2, y: 0});
    } else if (countingUp % 2 != 0 && onPlatform.collided && reverseOdd == true) {
      Body.translate(helmetBody,{x: -2, y: 0});
    } else if (countingUp % 2 != 0 && onPlatform.collided && reverseOdd == false) {
      Body.translate(helmetBody,{x: +2, y: 0});
    }
  });

  for (let i = 0; i < platformCount; i++) {
    drawBody(platforms[i]);
  }

  drawBody(obstacleWall)
  drawBody(ramp)

  // UFO Logic
  fill('red')
  drawBodies(projectiles)
  drawSprite(ufo, ufoSprite)

  onEnemyTerritory = Matter.SAT.collides(helmetBody, marsGround2);

  if(onEnemyTerritory.collided && shootingEnemy == false) {
      projectileRelease();
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
  if(helmetBody.position.x < windowWidth*2) {
    Composite.add(world, blockStack);
  }
}

function projectileRelease() {
  shootingEnemy = true;
  if (projectileNumber < projectilesCount) {
    setTimeout(function() {
      Matter.Body.setStatic(projectiles[projectileNumber], false)
      Composite.add(world, projectiles[projectileNumber])
      Body.setVelocity(projectiles[projectileNumber], {x: -(ufo.position.x - helmetBody.position.x)*0.05, y: -(ufo.position.y - helmetBody.position.y)*0.05})
      projectileNumber++
      projectileRelease()
    }, 1000)
  }
}

function spawnDebris(x, y) {
  //console.log('There appears to be a...');
  switch (round(random(0, 1))) {
    case 0:
        //console.log('New Comet!');
        let sprite = new Sprite(cometSpriteData, cometSpriteSheet, 0.075);
        let body = Bodies.circle(x, y, sprite.animation[0].height / 4, {angle: 1.25 * Math.PI, mass: 0.25});
        spaceObjects.push(new Comet(body, sprite));
        Composite.add(world, body);
        break;
      case 1:
        //console.log('New Satellite!');
        satelliteBody = Bodies.rectangle(x, y, satelliteSprite.width, satelliteSprite.height, {torque: random(-100, 100), mass: 0.2});
        spaceObjects.push(new Satellite(satelliteBody, satelliteSprite));
        Composite.add(world, satelliteBody);
        break;
    default:
      break;
  }

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
