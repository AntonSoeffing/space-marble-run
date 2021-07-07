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

let rocket;
let rocketSpriteData;
let rocketSpriteSheet;

let blackHole;
let blackHoleSprite;

let spaceObjects = [];

let helmet;
let helmetSprite;
let helmetOnGround;

let cometSpriteData;
let cometSpriteSheet;

let satelliteSprite;

let planetSprite;
let moonSprite;
let star0Sprite;
let star1Sprite;
let star2Sprite;
let marsSprite;

let pixelFont;

let scene = 'intro';

let reverse = false;
let platforms = [];
let platformCount = 5;
let platformXCord;
let platformYCord;
let onPlatform;
let reverseOdd = false;
let reverseEven = false;

let projectiles = []
let projectilesCount = 50;
let projectileNumber = 0;
let shootingEnemy = false;

let catapultOnlyOnce = true;

function preload() {
  // Preload images
  // Rocket
  rocketSpriteData = loadJSON('sprites/space/rocket/rocket_data.json');
  rocketSpriteSheet = loadImage('sprites/space/rocket/rocket_sheet.png');

  // Mars Background
  marsSprite = loadImage('sprites/backgrounds/mars/mars.png');

  // Space Background Elements
  planetSprite = loadImage('sprites/backgrounds/space/planet.png');
  moonSprite = loadImage('sprites/backgrounds/space/moon.png');
  star0Sprite = loadImage('sprites/backgrounds/space/stars/star_0.png');
  star1Sprite = loadImage('sprites/backgrounds/space/stars/star_1.png');
  star2Sprite = loadImage('sprites/backgrounds/space/stars/star_2.png');

  // Black Hole
  blackHoleSprite = loadImage('sprites/space/blackHole.png');

  // Helmet
  helmetSprite = loadImage('sprites/helmet.png');

  // Comets
  cometSpriteData = loadJSON('sprites/space/comet/comet_data.json');
  cometSpriteSheet = loadImage('sprites/space/comet/comet_sheet.png');
  // Satellite
  satelliteSprite = loadImage('sprites/space/satellite.png');

  //Wall
  wallSprite = loadImage('sprites/mars/wall.png')

  //Bridge
  bridgeSprite = loadImage('sprites/mars/bridge.png')

  // Ufo
  ufoSprite = loadImage('sprites/mars/ufo.png')

  //Platform
  platformSprite = loadImage('sprites/mars/platform.png')

  //Stone
  stoneSprite = loadImage('sprites/mars/stone.png')

  //Catapult
  catapultSupportSprite = loadImage('sprites/mars/catapult_support.png')
  stoneBallSprite = loadImage('sprites/mars/stone_ball.png')

  //Astronaut
  astronautHelmetSprite = loadImage('sprites/mars/astronaut/astronaut_helmet.png')
  astronautNoHelmetSprite = loadImage('sprites/mars/astronaut/astronaut_no_helmet.png')
  rocketLegsSprite = loadImage('sprites/mars/rocket_legs.png')

  // Preload fonts
  pixelFont = loadFont('fonts/pixelFont.ttf');
}

function setup() {
  createCanvas(windowWidth * 4, windowHeight);

  engine.gravity.y = 0;

  // Start Runner
  Runner.run(runner, engine);

  // Backgrounds
  spaceBackground = new Background('space', 60, 100);
  marsBackground = new Background('mars');

  // ----- SPACE -----
  // Intro scene
  rocket = new Sprite(rocketSpriteData, rocketSpriteSheet);

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
  //helmetBody = Bodies.circle(0, windowHeight * 0.7, helmetSprite.height / 2, {mass: 4});
  helmetBody = Bodies.circle(3000, windowHeight * 0.7, helmetSprite.height / 2, {mass: 4});
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

  Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(({ bodyA, bodyB }) => {
      if (bodyA == helmetBody || bodyB == helmetBody) {
        helmetOnGround = true;
      }
    });
  });

  // ----- MARS -----
  // Mars ground
  marsGround = Bodies.rectangle(windowWidth * 1.11, windowHeight * 0.82, windowWidth*0.22, 20, {isStatic: true})
  Composite.add(world, marsGround);

  marsGround2 = Bodies.rectangle(windowWidth * 2.5 , windowHeight * 0.82, windowWidth, 20, {isStatic: true})
  Composite.add(world, marsGround2);

  marsGround3 = Bodies.rectangle(windowWidth * 3.5 , windowHeight * 0.82, windowWidth, 20, {isStatic: true})
  Composite.add(world, marsGround3);

  groundHole = Bodies.rectangle(windowWidth * 1.28 , windowHeight * 0.91, windowWidth*0.16, 20, {isStatic: true, angle: 120})
  Composite.add(world, groundHole);

  groundHole2 = Bodies.rectangle(windowWidth * 1.53 , windowHeight * 0.91, windowWidth*0.16, 20, {isStatic: true, angle: 125})
  Composite.add(world, groundHole2);

  // Bridge
  const group = Body.nextGroup(true);
  const rects = Composites.stack(windowWidth*1.63, windowHeight*0.42, 15, 1, 10, 10, function(x, y) {
      return Bodies.rectangle(x, y, windowWidth*0.03, 20, { collisionFilter: { group: group } });
  });
  bridge = Composites.chain(rects, 0.5, 0, -0.5, 0, {stiffness: 1, length: 2, render: {type: 'line'}});

  // left and right fix point of bridge
  Composite.add(rects, Constraint.create({
    pointA: {x: windowWidth*1.63, y: windowHeight*0.42},
    bodyB: rects.bodies[0],
    pointB: {x: -25, y: 0},
    stiffness: 0.1
  }));
  Composite.add(rects, Constraint.create({
    pointA: {x: windowWidth*2.31, y: windowHeight*0.75},
    bodyB: rects.bodies[rects.bodies.length-1],
    pointB: {x: +25, y: 0},
    stiffness: 0.02
  }));

  // Platforms
  platformYCord = windowHeight * 0.78
  for (let i = 0; i < platformCount; i++) {
    if (i % 2 == 0) {
      platformXCord = windowWidth * 1.25;
    } else {
      platformXCord = windowWidth * 1.55;
    }
    platforms[i] = Bodies.rectangle(platformXCord, platformYCord, 200, 29 , {isStatic: true});
    platformYCord -= windowHeight*0.09
  }
  Composite.add(world, platforms);

  //Wall
  obstacleWall = Bodies.rectangle(windowWidth*1.61, windowHeight * 0.611,  113, 533, {isStatic: true})
  Composite.add(world, obstacleWall);

  //UFO
  ufo = Bodies.circle(windowWidth*2.5, windowHeight*0.15, 50, {isStatic: true});
  Composite.add(world, ufo);

  for (let i = 0; i < projectilesCount; i++) {
    projectiles[i] = Bodies.rectangle(windowWidth * 2.5, 200, 9,9, {isStatic: true, mass: 4})
  }

  // Stack of blocks
  blockStack = Composites.stack(windowWidth*2.4, 0 , 3, 10, 3, 3, function(x, y) {
    return Bodies.rectangle(x, y, 29, 29);
  });

  // PlatformUpDown
  platformUpDown = Bodies.rectangle(windowWidth*2.8, windowHeight*0.8, 200, 29 , {isStatic: true});
  Composite.add(world, platformUpDown);

  //PlatformStatic
  platformStatic1 = Bodies.rectangle(windowWidth*2.2, windowHeight*0.6, 200, 29 , {isStatic: true});
  Composite.add(world, platformStatic1);
  platformStatic2 = Bodies.rectangle(windowWidth*2.4, windowHeight*0.5, 200, 29 , {isStatic: true});
  Composite.add(world, platformStatic2);
  platformStatic3 = Bodies.rectangle(windowWidth*2.6, windowHeight*0.4, 200, 29 , {isStatic: true});
  Composite.add(world, platformStatic3);

  //downSlide
  downSlide = Bodies.rectangle(windowWidth * 3.06 , windowHeight * 0.4, windowWidth*0.45, 20, {isStatic: true})
  Composite.add(world, downSlide);
  Matter.Body.rotate(downSlide, 60)

  // Catapult
  catapultSupportLeft = Bodies.rectangle(windowWidth*3.38 , windowHeight * 0.7, 80, 120)
  catapultSupportRight = Bodies.rectangle(windowWidth*3.42, windowHeight * 0.7, 80, 120)
  catapult = Bodies.rectangle(windowWidth*3.4, windowHeight * 0.65, 600, 20)
  catapultActivator = Bodies.circle(windowWidth*3.5, -300, 50);

  //Astronaut
  astronautNoHelmet = Bodies.rectangle(windowWidth*3.8 , windowHeight * 0.715, 80, 180)
  rocketLegs = Bodies.rectangle(windowWidth*3.9 , windowHeight * 0.645, 80, 180)
}

function draw() {
  frameRate(60);
  switch (scene) {
    case 'intro':
      introScene();
      break;

    case 'main':
      if (engine.gravity.y == 1) {
        marsBackground.draw();
      } else {
        spaceBackground.draw();
      }

      scrollFollow(helmet.body);

      // ----- SPACE -----
      drawSprite(blackHole, blackHoleSprite);

      for (let i = 0; i < spaceObjects.length; i++) {
        if (spaceObjects[i] instanceof Comet && engine.gravity.y == 0) {
          // Comet
          Body.setAngle(spaceObjects[i].body, Vector.angle({x: 0, y: 0}, spaceObjects[i].body.velocity) + 1.25 * Math.PI);
          spaceObjects[i].sprite.drawAnimation(spaceObjects[i].body, spaceObjects[i].sprite.animation[0].height / 7, -spaceObjects[i].sprite.animation[0].width / 7);
        } else if (spaceObjects[i] instanceof Satellite && engine.gravity.y == 0) {
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
        if(countingUp % 2 == 0 && reverseEven == false && platforms[0].position.x < windowWidth * 1.55) {
          Body.translate(platforms[countingUp], {x: 4, y: 0})
        } else if (countingUp % 2 == 0 && reverseEven == true && platforms[0].position.x > windowWidth * 1.25) {
          Body.translate(platforms[countingUp], {x: -4, y: 0})
        } else if (countingUp % 2 != 0 && reverseOdd == false && platforms[1].position.x < windowWidth * 1.55) {
          Body.translate(platforms[countingUp], {x: 4, y: 0})
        } else if (countingUp % 2 != 0 && reverseOdd == true && platforms[1].position.x > windowWidth * 1.25) {
          Body.translate(platforms[countingUp], {x: -4, y: 0})
        } else if (platforms[0].position.x == windowWidth * 1.55) {
          reverseEven = true;
        } else if (platforms[0].position.x == windowWidth * 1.25) {
          reverseEven = false;
        } else if (platforms[1].position.x == windowWidth * 1.55) {
          reverseOdd = true;
        } else if (platforms[1].position.x == windowWidth * 1.25) {
          reverseOdd = false;
        }

        onPlatform = Matter.SAT.collides(helmetBody, platforms[countingUp]);

        if(countingUp % 2 == 0 && onPlatform.collided && reverseEven == false) {
          Body.translate(helmetBody,{x: 4, y: 0});
        } else if (countingUp % 2 == 0 && onPlatform.collided && reverseEven == true) {
          Body.translate(helmetBody,{x: -4, y: 0});
        } else if (countingUp % 2 != 0 && onPlatform.collided && reverseOdd == true) {
          Body.translate(helmetBody,{x: -4, y: 0});
        } else if (countingUp % 2 != 0 && onPlatform.collided && reverseOdd == false) {
          Body.translate(helmetBody,{x: 4, y: 0});
        }
      });

      for (let i = 0; i < platformCount; i++) {
        drawSprite(platforms[i], platformSprite);
      }

      if(reverse == false && platformUpDown.position.y < windowHeight*0.8) {
        Body.translate(platformUpDown, {x: 0, y: 4})
      } else if (reverse == true && platformUpDown.position.y > windowHeight*0.3) {
        Body.translate(platformUpDown, {x: 0, y: -4})
      } else if (platformUpDown.position.y == windowHeight*0.8) {
        reverse = true;
      } else if (platformUpDown.position.y < windowHeight*0.31) {
        reverse = false;
      }

      onPlatformUpDown = Matter.SAT.collides(helmetBody, platformUpDown);

      if(onPlatformUpDown.collided && reverse == false) {
        Body.translate(helmetBody, {x: 0, y: 4})
      }

      drawSprite(platformUpDown, platformSprite)
      drawSprite(platformStatic1, platformSprite)
      drawSprite(platformStatic2, platformSprite)
      drawSprite(platformStatic3, platformSprite)

      // UFO Logic
      fill('red')
      drawBodies(projectiles)
      drawSprite(ufo, ufoSprite)

      if(helmetBody.position.x > windowWidth * 2 && helmetBody.position.x < windowWidth * 3 && shootingEnemy == false) {
        shootingEnemy = true;
        projectileRelease();
      }

      if(helmetBody.position.x > windowWidth * 3) {
        shootingEnemy = false;
      }

      noStroke()
      fill('Sienna')
      drawBody(downSlide)
      drawBody(catapult)

      fill(40);

      drawSprite(obstacleWall, wallSprite)
      drawSprite(catapultSupportLeft, catapultSupportSprite)
      drawSprite(catapultSupportRight, catapultSupportSprite)
      drawSprite(catapultActivator, stoneBallSprite)

      onCatapult = Matter.SAT.collides(helmetBody, catapult)

      if(onCatapult.collided && catapultOnlyOnce == true) {
        catapultOnlyOnce = false;
        activateCatapult()
      }

      drawBodies(bridge.bodies);
      drawConstraints(bridge.constraints);

      for (let i = 0; i < 15; i++) {
        drawSprite(bridge.bodies[i], bridgeSprite);
      }

      for (let i = 0; i < 30; i++) {
        drawSprite(blockStack.bodies[i], stoneSprite);
      }

      drawSprite(astronautNoHelmet, astronautNoHelmetSprite)
      drawSprite(rocketLegs, rocketLegsSprite)

      hitAstronaut = Matter.SAT.collides(helmetBody, astronautNoHelmet)

      if(hitAstronaut.collided) {
        scene = 'gg'
      }

      break;

    case 'gg':
      ggWP()
      break;
    default:
      break;
    }
}

function keyPressed() {
  // is SPACE pressed?
  if (keyCode === 32 && engine.gravity.y == 0) {
    Body.setVelocity(helmet.body,
      {x: 15.25, y: -0.5}
    );
    // Tell p5.js to prevent default behavior on Spacebar press (scrolling)
    return(false);
    //&& helmetBody.velocity.y < 0.05 && helmetBody.velocity.y > -0.05
  } else if (keyCode === 32 && engine.gravity.y == 1 && helmetOnGround == true) {
    Body.applyForce(helmet.body,
      {x: helmet.body.position.x, y: helmet.body.position.y},
      {x: 0.035, y: -0.15}
    );
    helmetOnGround = false;
  }
}

function introScene() {
  let ms = millis();
  let x = millis() * 0.4 + windowWidth * 0.175;
  let y = - millis() * 0.4 + windowHeight * 1.2;
  let helmetX = windowWidth / 2 + ms * 0.3 - windowWidth * 0.2;
  let helmetY = windowHeight / 2 + ms * 0.1 - windowHeight * 0.15;

  const angle =  QUARTER_PI;

  push();
  background(10);


  if (ms < 1000) {
    rocket.drawFrame(0, x, y, angle);
  } else if (ms < 1100) {
    rocket.drawFrame(1, x, y, angle);
  } else if (ms < 1200) {
    rocket.drawFrame(2, x, y, angle);
  } else if (ms < 1300) {
    rocket.drawFrame(3, x, y, angle);
  } else if (ms < 1400) {
    rocket.drawFrame(4, x, y, angle);
  } else if (ms < 3500) {
    rocket.drawFrame(5, x, y, angle);


    push();
    translate(helmetX, helmetY);
    rotate(0.0005 * ms);
    imageMode(CENTER);
    image(helmetSprite, 0, 0);
    pop();

    textFont(pixelFont);
    fill(256);
    textSize(72);
    textAlign(CENTER, CENTER);
    text('Oh noo my helmet fml', 500, 500);
  } else {
    scene = 'main';
    console.log('main scene');
  }
  pop();
}

function gameOver() {
  Composite.clear(world);
  Engine.clear(engine);
  Runner.stop(runner);
  spaceObjects = [];
  setup();
}

function ggWP() {
  push();
  background(10);
  textFont(pixelFont);
  fill(256);
  textSize(72);
  textAlign(CENTER, CENTER);
  image(astronautHelmetSprite, windowWidth*3.59, windowHeight*0.4);
  text('First Level Completed', windowWidth*3.46, windowHeight*0.5);
  pop();
}

function marsLanding() {
  engine.gravity.y = 1;
  Composite.remove(world, blackHole);
  Body.translate(blackHole, {x: 0, y: 1000})
  if(helmetBody.position.x < windowWidth*1.2) {
    Composite.add(world, blockStack);
    //Composite.add(world, [bridge]);
    Composite.add(world, catapultSupportLeft);
    Composite.add(world, catapultSupportRight);
    Composite.add(world, catapult);
    Composite.add(world, astronautNoHelmet);
  }
}

function projectileRelease() {
  if (projectileNumber < projectilesCount && shootingEnemy == true) {
    setTimeout(function() {
      Matter.Body.setStatic(projectiles[projectileNumber], false)
      Composite.add(world, projectiles[projectileNumber])
      Body.setVelocity(projectiles[projectileNumber], {x: -(ufo.position.x - helmetBody.position.x)*0.04, y: -(ufo.position.y - helmetBody.position.y)*0.04})
      projectileNumber++
      projectileRelease()
    }, 1700)
  }
}

function activateCatapult() {
  Composite.add(world, catapultActivator);
  Body.setVelocity(catapultActivator, {x: 0, y: 80})
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
