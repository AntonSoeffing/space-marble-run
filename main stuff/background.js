class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = round(random(0,2));
    }
}

class Background {
    constructor(variant = 'space', starsCount = 20, spread = 250) {
        this.variant = variant;
        this.stars = [];
        
        if (this.variant == 'space') {
            // Generate stars with random position
            while (this.stars.length < starsCount) {
                let x = random(0, width);
                let y = random(0, height);

                let tooClose = false;
                let proposalStar = new Star(x, y);
                for (let i = 0; i < this.stars.length; i++) {
                    let existingStar = this.stars[i];
                    let distance = dist(proposalStar.x, proposalStar.y, existingStar.x, existingStar.y);
                    if (distance < spread) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    this.stars.push(proposalStar);
                }
            }
        }

    }

    draw() {
        switch (this.variant) {
            case 'space':
                background(10);
                
                // Draw Stars
                push();
                for (let i = 0; i < this.stars.length; i++) {
                    switch (this.stars[i].size) {
                        case 0:
                            drawingContext.globalAlpha = 0.8;
                            image(star0Sprite, this.stars[i].x, this.stars[i].y);
                            drawingContext.globalAlpha = 1;
                            break;
                        case 1:
                            drawingContext.globalAlpha = 0.8;
                            image(star1Sprite, this.stars[i].x, this.stars[i].y);
                            drawingContext.globalAlpha = 1;
                            break;
                        case 2:
                            drawingContext.globalAlpha = 0.8;
                            image(star2Sprite, this.stars[i].x, this.stars[i].y);
                            drawingContext.globalAlpha = 1;
                            break;
                        default:
                            break;
                    }
                }
                pop();

                // Draw Planet
                image(planetSprite, windowWidth * 0.85, windowHeight * 0.2);
               
                // Draw Moon
                image(moonSprite, windowWidth * 0.1, windowHeight * 0.2);
                break;
            case 'mars':
                background(marsSprite);
                break;
            default:
                background('red');
                break;
        }
    }
}