

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

        else if(this.headLocation.y  > height){
            return true;
        }
        else if(this.headLocation.y <0){
            return true;
        }
    }

    see(food){

        let see = 0;
        let sees= [];
        let vectors= [];
        let snakeToFood = p5.Vector.sub(food.location, this.headLocation);

        let leftV = createVector(this.velocity.x, this.velocity.y)
        leftV.mult(300);
        leftV.rotate(-Math.PI/3);

        vectors.push(createVector(leftV.x, leftV.y));
        for(let y=0; y<12; y++) {
            vectors.push(createVector(vectors[y].x, vectors[y].y));
            vectors[y+1].rotate(Math.PI/18);
        }


        for(let i=0; i<12; i++)
        {
            see= this.checkSector(vectors[i], vectors[i+1], snakeToFood);
            if(see)
                sees.push(0);
            else
                sees.push(1);
            sees.push(see);
        }

        for(let z=0; z<12; z++) {
            this.drawVector(this.headLocation, p5.Vector.add(vectors[z], this.headLocation), color(20*z+80, 10*z, 9*z+20));
        }

        return sees;
    }

    drawVector(base, vec, color){

        stroke(color);
        fill(color);
        line(base.x, base.y, vec.x, vec.y);
    }

    checkSector(leftV, rightV, snakeToFood){

        let is = 0;
        if(p5.Vector.dot(p5.Vector.cross(leftV, snakeToFood), p5.Vector.cross(leftV, rightV)) >= 0 && p5.Vector.dot(p5.Vector.cross(rightV, snakeToFood), p5.Vector.cross(rightV, leftV)) >= 0){
            is = 1;
        }
        return is;
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

class Network{
    constructor(sizes){
            this.activations=[];
            this.dist = gaussian(0, 1);
            this.sizes = sizes;
            this.num_layers = sizes.length;

             this.b = this.sizes.map(x => {
                let temp = [];
                for(let i = 0;  i < x; i++){
                    temp.push(this.dist.ppf(Math.random()));
                    //temp.push(Math.random());
                }
                return temp;
            });
            this.b.shift();

            this.w = this.sizes.map((x, index) => {
                let tmp1 = [];
                for(let i = 0; i < x; i++){
                    let tmp2 = [];
                    for(let j = 0; j <this.sizes[index-1]; j++ ){
                        tmp2.push(this.dist.ppf(Math.random()));
                        //tmp2.push(Math.random());
                    }

                    tmp1.push(tmp2);
                }
                return tmp1;
            });
            this.w.shift();


    }
    finalDecision(input){
        this.activations = [];
        this.activations.push(input);
        for(let i=0; i<this.num_layers-1; i++){
            this.activations.push(this.calculateInputs(this.activations[i], i));
        }
        let max=0;

        if(this.activations[this.num_layers-1][0]>max)
            max=this.activations[this.num_layers-1][0]
        if (this.activations[this.num_layers-1][1]>max)
            max=this.activations[this.num_layers-1][1];

        if(max==this.activations[this.num_layers-1][0]){
            turn("LEFT");
        }

        else
        {
            turn("RIGHT");
        }



        console.log(this.activations[3][0]);
        console.log(this.activations[3][1]);
    }
    calculateInputs(inputs , katmanNo){
        let temp=[];
        for(let i=katmanNo; i<katmanNo+1; i++) {
            for(let j = 0; j < this.b[i].length; j++ ){
                temp.push(this.sigmoid(this.w[i][j], this.b[i][j], inputs));
            }
        }
        return temp;


    }
    sigmoid(w,b, a){

        let temp=math.dot(w,a)+b;
        let sonuc = 1 / (1+Math.exp(temp*(-1)));
        return sonuc;
    }

}
//let net = new Network([24,16,16,2]);
// console.log(net.b);
// console.log(net.w);

let s, f, net;

function setup(){
    createCanvas(windowWidth -30, windowHeight-30);
    s = new Snake();
    f = new Food();
    net = new Network([24,16,16,2]);

}

function draw(){

    net = new Network([24,16,16,2]);
    if(s.isDead()) {
        fitnessList.push(s.fitness);
        s = new Snake();
    }
    if(f.checkCollision(s)){
        f = new Food();
    }
    background(0,0,0);
    net.finalDecision(s.see(f));
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

function turn(decision){
    if(decision=="LEFT")
        s.moveLeft();
    else if(decision=="RIGHT")
        s.moveRight();
}




