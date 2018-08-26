width =1920;
height = 1080;

let fitnessList = [];

class Snake{

    constructor(){
        this.headLocation = createVector(width/2, height/2);
        this.velocity = createVector(1, 0);
        this.acceleration = createVector(0,0);
        this.fitness=0;
    }

    display(){
        stroke(1);
        //background(0,0,0);
        fill(175);
        ellipse(this.headLocation.x, this.headLocation.y, 30, 30)
    }

    update(){
        this.velocity.add(this.acceleration);
        this.velocity.normalize();
        this.velocity.mult(5);
        this.headLocation.add(this.velocity);
        this.acceleration.mult(0);
        //this.velocity.mult(0);
    }

    moveLeft() {
        let v = createVector(this.velocity.x, this.velocity.y);
        v.rotate(-0.6);
        this.acceleration = v;
    }

    moveRight() {
        let v = createVector(this.velocity.x, this.velocity.y);
        v.rotate(0.6);
        this.acceleration = v;
    }

    isDead(){
        if(this.headLocation.x + 15 > width){
           return true;

        }
        else if(this.headLocation.x - 15< 0){
            return true;
        }

        else if(this.headLocation.y + 15 > height){
            return true;
        }
        else if(this.headLocation.y  - 15<0){
            return true;
        }
    }

    see(food){
        let leftV = createVector(this.velocity.x, this.velocity.y)
        leftV.mult(300);
        leftV.rotate(Math.PI/3);
        let rightV = createVector(this.velocity.x, this.velocity.y);
        rightV.rotate(5*Math.PI/3);
        rightV.mult(300);

        let snakeToFood = p5.Vector.sub(food.location, this.headLocation);
        //let n = createVector(mouseX, mouseY);
        //let snakeToFood = p5.Vector.sub(n, this.headLocation);
        let is = 0;
        if(p5.Vector.dot(p5.Vector.cross(leftV, snakeToFood), p5.Vector.cross(leftV, rightV)) >= 0 && p5.Vector.dot(p5.Vector.cross(rightV, snakeToFood), p5.Vector.cross(rightV, leftV)) >= 0){
            is = 1;
        }

        console.log(is);


        this.drawVector(this.headLocation, p5.Vector.add(leftV, this.headLocation), color(100,20,15));
        this.drawVector(this.headLocation, p5.Vector.add(rightV, this.headLocation), color(100,90,15));

    }

    drawVector(base, vec, color){

        stroke(color);
        fill(color);
        line(base.x, base.y, vec.x, vec.y);
    }
}





class Food{
    constructor(){
        this.location = createVector(random(width), random(height));
    }
    display(){
        stroke(0);
        fill(175);
        ellipse(this.location.x, this.location.y, 15,15 );
    }
    checkCollision(snake){
        let tempv = p5.Vector.sub(snake.headLocation, this.location);
        let mg = tempv.mag();
        mg = Math.abs(mg);
        if(mg < 22.5){
            snake.fitness++;
            console.log(snake.fitness);
            return true;

        }


    }



}

let s, f;

function setup(){
    createCanvas(windowWidth -30, windowHeight-30);
    s = new Snake();
    f = new Food();

}

function draw(){


    if(s.isDead()) {
        fitnessList.push(s.fitness);
        s = new Snake();
    }
    if(f.checkCollision(s)){
        f = new Food();
    }
    background(0,0,0);
    s.see(f);
    f.display();
    s.update();
    s.display();
    textSize(32);
    text(s.fitness, 10, 30);


}

function keyPressed(){
    if(keyCode === LEFT_ARROW){
        s.moveLeft();
    }
    if(keyCode === RIGHT_ARROW){
        s.moveRight();
    }
}




