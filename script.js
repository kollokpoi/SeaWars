document.addEventListener('DOMContentLoaded',function(){
    const gameContainer = document.querySelector('.game-container');
    const crosshair = document.querySelector('.crosshair');

    const enemies = new Array();

    let ableToShoot = true;

    let score = 0;
    document.addEventListener('mousemove', function(e){
        gunItem.rotate(e);
    })

    document.addEventListener('click',(e)=>{
        if(!ableToShoot)
            return;

        ableToShoot = false;
        setTimeout(() => {
            ableToShoot = true
        }, 1000);
        gunItem.shoot(e);
    });


    class gun{
        center;
        constructor(element, rotationDiv){
            this.element = element;
            this.rotationDiv = rotationDiv;
        }

        rotate(e){
            let angle = Math.atan2(e.clientY - window.innerHeight,e.clientX - window.innerWidth/2);
            let maxRotation = 60;
            let rotateZAngle = angle * (180/Math.PI) + 90;
            let zRotation = Math.min(rotateZAngle,maxRotation);
    
            if(zRotation<0){
                zRotation = Math.max(rotateZAngle,-maxRotation);
            }
    
            let mouseRelativeToCenter = e.clientY - 100;
    
            let maxXRotation = 40;
            let xRotation = (mouseRelativeToCenter/window.innerHeight) * maxXRotation;

            if(rotateZAngle>maxRotation && rotateZAngle<-maxRotation){
                ableToShoot = false;
                return;
            }

            let length = this.rotationDiv.clientHeight * 1.2;

            let realRotate = Math.abs(zRotation - 90) * 0.0175;

            let cos = Math.cos(realRotate) * 0.5;
            let sin = Math.sin(realRotate) * 0.5;

            let x2 = window.innerWidth/2 + (length * cos);
            let y2 = window.innerHeight - (length * sin);

            this.center = {
                x: x2,
                y: y2
            };
    
            crosshair.style.left = `${e.clientX - crosshair.clientWidth/2}px`;
            crosshair.style.top  = `${e.clientY - crosshair.clientHeight/2}px`;

            this.rotationDiv.style.transform = `rotateZ(${zRotation}deg)`;
            this.element.style.transform = `rotateX(${xRotation}deg)`;
        }

        shoot(e){
    
            let endPosition = {
                x:e.clientX,
                y:e.clientY
            };
    
            let bulletItem = new bullet(endPosition,this.center);
        }
    }
    class enemyItem{
        directions = {left:0,right:1};
        constructor(){
            let element = document.createElement('div')
            element.className='enemyItem';

            let rColor = Math.floor(Math.random()*255);
            let gColor = Math.floor(Math.random()*255);
            let bColor = Math.floor(Math.random()*255);

            element.style.background = `rgb(${rColor},${gColor},${bColor})`;

            let size = Math.random()*(300-100) + 100;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;

            this.element = element;
            this.size = size;

            this.direction = Math.floor(Math.random()*2);

            this.createElement();
        }

        createElement(){
            this.element.style.top = `${Math.random() * (window.innerHeight/2 - (this.size +30) ) + (this.size +30)}px`;

            console.log(this)

            switch (this.direction) {
                case this.directions.right:{
                    this.element.style.left = `${window.innerWidth}px`;
                }
                    break;
                case this.directions.left:{
                    this.element.style.left = `${-this.size}px`;
                }
                    break;
            }

            gameContainer.appendChild(this.element);

            setTimeout(()=>{
                switch (this.direction) {
                    case this.directions.right:{
                        this.element.classList.add('left');
                        this.element.style.left = `${-this.size}px`;
                    }
                        break;
                    case this.directions.left:{
                        this.element.classList.add('right');
                        this.element.style.left = `${window.innerWidth}px`;

                    }
                        break;
                }
            },100);

        }
        destroy(){
            this.element.style.opacity = 0;
            gameContainer.removeChild(this.element);
        }
    }
    class bullet{
        constructor(endPoint,startPosition){
            this.endPoint = endPoint;
            this.startPosition = startPosition;
            this.createElement();
            this.processing();
        }

        processing(){
            let x = this.startPosition.x - this.item.clientWidth/2;
            let y = this.startPosition.y - this.item.clientHeight/2;

            let endX = this.endPoint.x - this.item.clientWidth/2;
            let endY = this.endPoint.y - this.item.clientHeight/2;

            let item = this.item;

            let length = Math.sqrt(((x-endX)*(x-endX)) + ((y-endY)*(y-endY)));

            if(endX>x)
                length*=-1;

            let xSpeed = (endX - x) / 100; // px per 1/100 of second
            let ySpeed = (y - endY) /100; // px per 1/100 of second
            let stablehitItem = this.hitItem;
            let interval = setInterval(()=>{
                x += xSpeed;
                y -= ySpeed;
                item.style.top = `${y}px`;
                item.style.left = `${x}px`;

                if(y<= endY){
                    stablehitItem(item);
                    clearInterval(interval);
                }
            },10)
        }

        hitItem(itemBlock){
            console.log('boom');
            let item = document.createElement('div');
            item.className = 'bullet-inner';
            
            let size = itemBlock.clientHeight * 3;

            item.style.height = `${size}px`;
            item.style.width = `${size}px`;

            item.style.top = `${itemBlock.offsetTop - size/2.4}px`;
            item.style.left = `${itemBlock.offsetLeft - size/3}px`;

            gameContainer.appendChild(item);

            let i = 0;
            let interval = setInterval(()=>{
                i++;
                if(i<=11){
                    item.style.background = `url(sprites/boomItem/${i}.png)`;
                }
                else{
                    gameContainer.removeChild(item);
                    clearInterval(interval);
                }
            },60)


            let leftPosition = itemBlock.offsetLeft;
            let topPosition = itemBlock.offsetTop;
            let rightPosition = leftPosition+itemBlock.clientHeight;
            let bottomPosition = topPosition+itemBlock.clientHeight;

            for (const it of enemies) {

                let topEnemyPosition = it.element.offsetTop;
                let leftEnemyPosition = it.element.offsetLeft;
                let bottomEnemyPosition = topEnemyPosition + it.element.clientHeight;
                let rightEnemyPosition = leftEnemyPosition+it.element.clientWidth;

                if(leftEnemyPosition<0 && rightPosition>window.innerWidth)
                    gameContainer.removeChild(it.element);

                if(topPosition<bottomEnemyPosition && topEnemyPosition<bottomPosition){
                    let isHit = false;

                    if(rightPosition>leftEnemyPosition && rightPosition<rightEnemyPosition){
                        isHit = true;
                    }
                    if(leftPosition>leftEnemyPosition && leftPosition<rightEnemyPosition){
                        isHit = true;
                    }
                    if(isHit){
                        score++;
                        document.getElementById('score').textContent = score;
                        it.destroy();
                        break;
                    }
                }
            }
            gameContainer.removeChild(itemBlock);
        }

        createElement(){
            let item = document.createElement('div');
            item.className = 'bullet';

            let size = 100;
            this.size = size;
            item.style.height=`${size}px`;
            item.style.width=`${size}px`;

            item.style.top = `${this.startPosition.y - size/2}px`;
            item.style.left = `${this.startPosition.x - size/2}px`;

            this.item = item;

            gameContainer.appendChild(item);
        }
    }
    new enemyItem();

    setInterval(()=>{
        let enemy = new enemyItem();
        enemies.push(enemy);
    },1000)
    const gunItem = new gun (document.querySelector('.cannon'),document.querySelector('.rotation'));
})