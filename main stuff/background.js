class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
                    drawingContext.globalAlpha = 0.8;
                    image(starSprite, this.stars[i].x, this.stars[i].y);
                    drawingContext.globalAlpha = 1;
                }
                pop();

                // Draw Planet
                image(planetSprite, windowWidth * 0.8, windowHeight * 0.2);
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