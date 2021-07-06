class Sprite {
    constructor(spriteData, spriteSheet, speed = 0.5) {
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
       
    drawAnimation(body, offsetX, offsetY) {    
        const pos = body.position;
        const angle = body.angle;
        
        this.index += this.speed;
        let index = floor(this.index) % this.animation.length;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.animation[index], offsetX, offsetY);
        pop();
    }

    drawFrame(frame = 0, x, y, angle = 0) {
        this.angle = angle;
        push();
        imageMode(CENTER);
        translate(x, y);
        rotate(this.angle);
        image(this.animation[frame], 0, 0);
        pop();
        
    }
}