let font;

function preload() {
    font = loadFont("fonts/Geist-Light.otf");
}

const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Vertices = Matter.Vertices;

let engine;
let words = [];
let ground, wallLeft, wallRight;

let nextY = 100;

function setup() {
    createCanvas(windowWidth, windowHeight);
    engine = Engine.create();
    
    let wordsToDisplay = [
        { text: "NO FLIP FLOPS ", action: () => alert("Seriously, stop wearing flip flops!") },
        { text: "MIND YOUR BUSINESS", action: () => alert("Keep your head down. Keep walking.") },
        { text: "AVOID SANTA CON ", action: () => alert("Mark your calendar. Stay inside.") },
    ];

    ground = Bodies.rectangle(width / 2, height - 20, width, 10, { isStatic: true });
    wallLeft = Bodies.rectangle(0, height / 2, 10, height, { isStatic: true });
    wallRight = Bodies.rectangle(width, height / 2, 10, height, { isStatic: true });

    World.add(engine.world, [ground, wallLeft, wallRight]);

    textFont(font);
    textSize(40);

    for (let item of wordsToDisplay) {
        let { width, height } = measureText(item.text);
        words.push(new Word(random(width, width * 2), nextY, item.text, width, height, item.action));
        nextY += 350;
    }
}

function draw() {
    clear();
    Engine.update(engine);

    let hovering = false;

    for (let word of words) {
        if (word.isHover(mouseX, mouseY)) {
            hovering = true;
        }
        word.show();
    }

    if (hovering) {
        cursor("pointer");
    } else {
        cursor("default");
    }
}


function measureText(word) {
    let padding = 30;
    let width = textWidth(word.toUpperCase()) + padding;
    let height = textAscent() + textDescent() + padding;
    return { width, height };
}

class Word {
    constructor(x, y, word, width, height, buttonAction, mouseHover) {
        this.word = word;
        this.width = width;
        this.height = height;
        this.buttonAction = buttonAction;
        this.mouseHover = mouseHover;
        this.isCurrentlyHovered = false;

        this.body = Bodies.rectangle(x, y, this.width, this.height, {
            restitution: 0.09,
            friction: 1,
            density: 3,
        });

        World.add(engine.world, this.body);
    }

    show() {
        let pos = this.body.position;
        let angle = this.body.angle;

        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        
        if (this.isCurrentlyHovered) {
            fill(254, 0, 0); 
            stroke(255);  
        } else {
            fill(0);
            stroke(254, 0, 0);
        }
        
        strokeWeight(2);
        rect(0, 0, this.width, this.height, 10);
        noStroke();
        textFont(font);
        
        if (this.isCurrentlyHovered) {
            fill(255); 
        } else {
            fill(254, 0, 0);
        }
        
        textSize(40);
        textAlign(CENTER, CENTER);

        let offset = -5;
        text(this.word.toUpperCase(), 0, offset);

        pop();
    }

    isClicked(mx, my) {
        return this.checkMouseInBounds(mx, my);
    }

    triggerAction() {
        if (this.buttonAction) {
            this.buttonAction();
        }
    }

    isHover(mx, my) {
        const isHovering = this.checkMouseInBounds(mx, my);
    
        if (isHovering !== this.isCurrentlyHovered) {
            this.isCurrentlyHovered = isHovering;
    
            if (this.mouseHover) {
                this.mouseHover(isHovering);
            }
        }
    
        if (isHovering) {
            cursor("pointer");
        } else {
            cursor("default");
        }
    
        return isHovering;
    }
    

    checkMouseInBounds(mx, my) {
        let pos = this.body.position;
        let angle = this.body.angle;

        let localMouseX = cos(-angle) * (mx - pos.x) - sin(-angle) * (my - pos.y);
        let localMouseY = sin(-angle) * (mx - pos.x) + cos(-angle) * (my - pos.y);

        return (
            abs(localMouseX) < this.width / 2 &&
            abs(localMouseY) < this.height / 2
        );
    }
}

function mousePressed() {
    for (let word of words) {
        if (word.isClicked(mouseX, mouseY)) {
            word.triggerAction();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}