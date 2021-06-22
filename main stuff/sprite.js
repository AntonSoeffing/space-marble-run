class Sprite {
    constructor(spriteData, spriteSheet, speed) {
        this.spriteData = spriteData;
        this.spriteSheet = spriteSheet;
        this.animation = [];
        this.speed = speed;
        this.index = 0;
        this.pos;
        this.angle;

        let frames = spriteData.frames;
        for (let i = 0; i < frames.length; i++) {
            let frame = frames[i].frame;
            let img = spriteSheet.get(frame.x, frame.y, frame.w, frame.h);
            this.animation.push(img);
        }
    }
       
    draw(body, offsetX, offsetY) {    
        const pos = body.position;
        const angle = body.angle;
        
        push();
        this.index += this.speed;
        let index = floor(this.index) % this.animation.length;
        translate(pos.x, pos.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.animation[index], offsetX, offsetY);
        pop();
    }