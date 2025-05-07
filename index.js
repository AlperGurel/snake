import gaussian from './gaussian-wrapper.js';

let p;
let width = 1400;
let height = 800;

let fitnessList = [];
let snakes = [];
let foods = [];
let newGens = [];
const NETWORKSTRUCTURE = [24,16,16,2];
let cycle;
let myShow = 1;
let mFitness = 0;
let food;
let snake;
let gen;
let myflag;
let windowWidth = 1400;
let windowHeight = 800;

function dotProduct(v1, v2) {
    let sum = 0;
    for (let i = 0; i < v1.length; i++) {
        sum += v1[i] * v2[i];
    }
    return sum;
}

class Snake{
    p;
    constructor(brain, p){
        this.p = p;
        if(brain === undefined) {
            this.brain = new Network([24, 16, 16, 2]);
        }
        else
            this.brain=brain;
        this.dist = gaussian(0, 1);
        // this.headLocation = this.p.createVector(Math.random()*(width-30)+30, Math.random()*(height-30)+30);
        this.headLocation = this.p.createVector(width/2, height/2);
        this.velocity = this.p.createVector(1, 0);
        this.acceleration = this.p.createVector(0,0);
        this.fitness=0;
        this.health=50;
        this.inputs = [];
        for(let i = 0; i < 24; i++){
            if(i%2===0){
                this.inputs[i] = 1;
            }
            else{
                this.inputs[i] = 0;
            }
        }
    }


    display(snakeColor){
        this.p.stroke(1);
        //p.background(0,0,0);
       
            this.p.fill(175);

        this.p.ellipse(this.headLocation.x, this.headLocation.y, 30, 30)
    }

    update(){
        // this.velocity.add(this.acceleration);
        // this.velocity.normalize();
        // this.velocity.mult(14);
        // this.headLocation.add(this.velocity);
        // this.acceleration.mult(0);
        // this.turn(this.brain.finalDecision(this.inputs));
    }

    turn(decision){
        if(decision=="LEFT")
            this.moveLeft();
        else if(decision=="RIGHT")
            this.moveRight();
    }
    moveLeft() {
        let v = this.p.createVector(this.velocity.x, this.velocity.y);
        v.rotate(-0.9);
        this.acceleration = v;
    }

    moveRight() {
        let v = this.p.createVector(this.velocity.x, this.velocity.y);
        v.rotate(0.9);
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
        else
            return false;
    }

    see(foods){

        let see = 0;

        let vectors= [];

        let magnitude =0;
        let leftV = this.p.createVector(this.velocity.x, this.velocity.y)
        leftV.mult(300);
        leftV.rotate(-Math.PI/3);

        vectors.push(this.p.createVector(leftV.x, leftV.y));
        for(let y=0; y<12; y++) {
            vectors.push(this.p.createVector(vectors[y].x, vectors[y].y));
            vectors[y+1].rotate(Math.PI/18);
        }

        for(let j = 0; j < 12; j++){
            let flag = false;
            for(let i = 0; i < foods.length; i++){
                let snakeToFood = p5.Vector.sub(foods[i].location, this.headLocation);
                magnitude = snakeToFood.mag();
                magnitude= magnitude/(Math.sqrt(Math.pow(windowWidth,2)+Math.pow(windowHeight,2)));
                see= this.checkSector(vectors[j], vectors[j+1], snakeToFood);
                if(see){
                    flag = true;
                }
            }
            if(flag){
                this.inputs[j*2]=0;
                this.inputs[j*2+1] = 1;
            }
            else
            {
                this.inputs[j*2]=1;
                this.inputs[j*2+1]=0;
            }


        }


        //for(let z=0; z<12; z++) {
        //    this.drawVector(this.headLocation, p5.Vector.add(vectors[z], this.headLocation), color(20*z+80, 10*z, 9*z+20));
        //}


    }

    drawVector(base, vec, color){

        this.p.stroke(color);
        this.p.fill(color);
        this.p.line(base.x, base.y, vec.x, vec.y);
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
    p;
    constructor(p){
        this.p = p;
        this.location = p.createVector(Math.random()*width, Math.random()*height);
        this.velocity = p.createVector(Math.random()*3 - 1.5, Math.random()*3-1.5);
    }
    display(){
        this.p.stroke(0);
        this.p.fill(this.p.color(30,150,150));
        this.p.ellipse(this.location.x, this.location.y, 15,15 );

    }
    update(){
        this.location.add(this.velocity);
    }
    checkCollision(snake){
        let collided = false;
        for(let i = 0; i< snake.length; i++){
            let tempv = p5.Vector.sub(snake[i].headLocation, this.location);
            let mg = tempv.mag();
            mg = Math.abs(mg);
            if(mg < 22.5){
                collided = true;
                snake[i].fitness+=20;
                snake[i].health+=20;
                break;

            }
        }
        return collided;
    }
    isDead(){
        if(this.location.x + 15 > width){
           
            return true;
        
// step 1
        }
        else if(this.location.x - 15< 0){

            return true;
        }

        else if(this.location.y  > height){
           
            return true;
        }
        else if(this.location.y <0){
    
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
                    //temp.push(this.dist.ppf(Math.random()));
                    temp.push(Math.random()*10-5);
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
            return ("LEFT");
        }

        else
        {
            return ("RIGHT");
        }




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

        let temp=dotProduct(w,a)+b;
        let sonuc = 1 / (1+Math.exp(temp*(-1)));
        return sonuc;
    }

}



class Genetic{
    constructor(){
         this.tempDna= [];
         this.maxFitnessGen = {
         };
         this.count = 0;

    }
    makeChild(ancestors){
        //maxfitnessa göre seç
        // Gelen dna listesini sırala

        let dnaList = [];
        if(this.count == 0){
            this.maxFitnessGen = ancestors[0];
            this.count++;
        }
        
        for(let i=0; i<ancestors.length; i++)
        {
            if(ancestors[i].fitness > this.maxFitnessGen.fitness){
                this.maxFitnessGen = ancestors[i];
            }
            for(let j=i+1; j<ancestors.length; j++)
                if(ancestors[i].fitness > ancestors[j].fitness){

                }
                else{
                    let temp = ancestors[i];
                    ancestors[i] = ancestors[j];
                    ancestors[j] = temp;
                }
        }
        // 2 adet parent getir
        let parents = this.chooseParents((ancestors));



        // gelen parentları dnaList'e açık şekilde al
        for(let i=0; i<parents.length; i++) {
            this.tempDna=[];
            this.goDown(parents[i]);
            dnaList.push(this.tempDna);
        }

        let child = this.crossingOver(dnaList);
        let mutatedchild = this.mutateDna(child);   
        
        return this.brainChild(mutatedchild);
    }
    chooseParents(ancestors){
       let chosenParents = [];
       //this.ancestors=[];
       for(let i=0; i<2; i++)
       {   
           if(i == 0 && ancestors[i].fitness > this.maxFitness){
                chosenParents.push(ancestors[i]);
           }
           else if(i == 1 ){
                chosenParents.push(ancestors[i])
           }
           else{
                chosenParents.push(this.maxFitnessGen);
           }
           
       }
       return chosenParents;
    }

    goDown(a){
        for(let i in a) {
            if (i != "fitness") {
                if (Array.isArray(a[i]))
                    this.goDown(a[i])
                else
                    this.tempDna.push(a[i]);
            }
        }
    }
    getAncestors(index){
        let ancestors = [];
        for(let i=0; i<snakes.length; i++){
                let tempGens= {};
                tempGens.fitness = snakes[i].fitness;
                tempGens.weight = snakes[i].brain.w;
                tempGens.bias = snakes[i].brain.b;
                ancestors.push(tempGens);
        }
        return gen.makeChild(ancestors);
    }
    crossingOver(dnaList){
        /*
        let w1 = [];
        let b1 = [];
        let w2 = [];
        let b2 = [];

        w1 = dnaList[0].slice(0, 336);
        b1 = dnaList[0].slice(336, 353);
        w2 = dnaList[1].slice(336, 672);
        b2 = dnaList[1].slice(351, 368);
        let childw = w1.concat(w2);
        let childb = b1.concat(b2);
        let child = childw.concat(childb);
        return child;*/
        let child =[];
        for(let j=0; j<705; j+=10)
        {
            let number=Math.random();
            for(let i=j; i<j+10;i++){      
                if(number>0.5)
                    child.push(dnaList[0][i]);
                else
                    child.push(dnaList[1][i]);
            }
        }
        child.push(dnaList[0][705]);
        return child;
        
    }
    mutateDna(dna){
        let dnaM = dna;
        for(let i = 0; i<dnaM.length; i++){
            let a = Math.random();
            if(a >0.99 ){
                let r = Math.random()*10 - 5;
                dnaM[i] = r;
            }
        }
        return dnaM;

    }
    brainChild(dna){
        let dnaStructure = NETWORKSTRUCTURE;
        let b= 672;
        let w=0;
        
        let bNetwork = new Network(dnaStructure);
        
        bNetwork.b = bNetwork.sizes.map((x,index) => {
            if(index!=0){
                let temp = [];
                for(let i = 0;  i < x; i++){
                    temp.push(dna[b]);
                    //temp.push(Math.random());
                }
                return temp;
            }
        });
        bNetwork.b.shift();

        bNetwork.w = bNetwork.sizes.map((x, index) => {
            if(index!=0){
                let tmp1 = [];
                for(let i = 0; i < x; i++){
                    let tmp2 = [];                 
                        for(let j = 0; j <bNetwork.sizes[index-1]; j++ ){
                            tmp2.push(dna[w]);
                            w++;
                            //tmp2.push(Math.random());
                        }
                    

                    tmp1.push(tmp2);
                }
                return tmp1;
            }
        });
        bNetwork.w.shift();
        return bNetwork;
    }
   

}


const snakeCount = 1;
const foodCount = 0;
new p5((p5Instance) => {
    // p = p5Instance;
    p5Instance.setup = () => {
        p5Instance.createCanvas(windowWidth, windowHeight);
        p5Instance.colorMode(p5Instance.HSL, 360, 100, 100)
        cycle=1;
        mFitness=0;
        for(let i = 0; i < foodCount; i++){
            food = new Food(p5Instance);
            foods.push(food);
        }
        for(let i = 0; i < snakeCount; i++){
            snake = new Snake(undefined, p5Instance);
            snakes.push(snake);
        }
        gen = new Genetic();
        myflag=0;
    }
    p5Instance.draw = () => {
        p5Instance.frameRate(10);
        for(let i=0; i<cycle; i++){
            for(let i = 0; i < snakes.length; i++){
                if(snakes[i].fitness>mFitness)
                {
                mFitness=snakes[i].fitness;
                
                }
            }
            
            for(let i = 0; i < snakes.length; i++){
                snakes[i].health-=0.1;
                snakes[i].fitness+=0.0;
                if(snakes[i].isDead() || snakes[i].health<=0 )
                {
                    
                    for(let k=0; k<snakeCount; k++)
                    snakes[i] = new Snake(gen.getAncestors(i), p5Instance);
                    
                    //todo genden çıkacak çocuğu yeni snake oluştururken kullanıcaz.
                }
                snakes[i].see(foods);
                snakes[i].brain.finalDecision(snakes[i].inputs);
            }
        
            for(let i = 0; i < snakes.length; i++){
                snakes[i].update();
                
            }
            for(let i = 0; i < foods.length; i++){
                if(foods[i].checkCollision(snakes)) {
                    foods[i] = new Food(p5Instance);
                }
                if(foods[i].isDead())
                {
                    foods[i]= new Food(p5Instance);
                }
                foods[i].update();
                
            }
            }



        p5Instance.background(160, 90, 18);
        p5Instance.textSize(32);
        // p5Instance.text(mFitness, 10, 30);
        if(myShow==1){
            for(let food of foods)
            food.display();
            for(let snake of snakes)
            snake.display();
        }
    }   
    // setup(p5Instance);
    // p5Instance.draw = () => draw(p5Instance);
});



