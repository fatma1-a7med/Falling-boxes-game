window.onload = function(){ 
    let gameStarted = false;
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').innerText = userName;
    const lastScore = localStorage.getItem(`${userName}_score`);
    if (lastScore) {
        Swal.fire({
         title: `Welcome Back ${userName}!`,
         html: `Your last score: <strong>${lastScore}</strong>`,
         icon: 'info'
       });
    }
                   
    class Box {
      constructor({ position, color }) {
            this.speed = {
                x: 0,
                y: 0
            };
            this.color = color;
            this.width = 30;
            this.height = 30;
            this.element = this.createBoxElement(position);
        }
        createBoxElement(position) {
            const box = document.createElement('div');
            box.className = 'box';
            box.style.left = position.x + 'px';
            box.style.top = position.y + 'px';
            box.style.backgroundColor = this.color;
            document.body.appendChild(box);
            return box;
        }
        update(speed) {
            this.speed = speed;
            this.element.style.left = parseFloat(this.element.style.left) + this.speed.x + 'px';
            this.element.style.top = parseFloat(this.element.style.top) + this.speed.y + 'px';
        }
    }
    class Grid {
        constructor(level) {
            this.boxes = [];
            this.level = level;
            this.setSpeed();
            const rows = Math.floor(Math.random() * 5 + 2);
            const columns = Math.floor(Math.random() * 10 + 5);
            for (let x = 1; x < columns; x++) {
                for (let y = 2; y < rows; y++) {
                    let color = 'green';
                    if (Math.random() < 0.1) {
                        color = 'red';
                    }
                    const spacing = 15;
                    const boxPosition = {
                        x: x * (30 + spacing),
                        y: y * (30 + spacing),
                    };
                    this.boxes.push(new Box({
                        position: boxPosition,
                        color,
                    }));
                }
            }
        }
        setSpeed() {
            if (this.level === 'easy') {
                this.speed = { x: 3, y: 0 };
            } else if (this.level === 'hard') {
                this.speed = { x: 7, y: 0 };
            }
        }
        update() {
            this.boxes.forEach((box) => {
                if (box && box.element) {
                    box.update(this.speed);
                    
                }
            });
            const firstBox = this.boxes[0];
            const lastBox = this.boxes[this.boxes.length - 1];
            if (firstBox && lastBox && firstBox.element && lastBox.element) {
                const firstBoxLeft = parseFloat(firstBox.element.style.left);
                const lastBoxRight = parseFloat(lastBox.element.style.left) + firstBox.width;
                if (firstBoxLeft <= 0 || lastBoxRight >= window.innerWidth) {
                    this.speed.x = -this.speed.x;
                    this.boxes.forEach((box) => {
                        if (box && box.element) {
                            box.element.style.top = parseFloat(box.element.style.top) + 20 + 'px';
                        }
                    });
                }
            }
        }
        checkBulletCollisions(bullet) {
            let allBoxesDestroyed = true;
        
            this.boxes.forEach((box) => {
                const boxRect = box.element.getBoundingClientRect();
                const bulletRect = bullet.bullet.getBoundingClientRect();
        
                if (
                    bulletRect.left < boxRect.right &&
                    bulletRect.right > boxRect.left &&
                    bulletRect.top < boxRect.bottom &&
                    bulletRect.bottom > boxRect.top
                ) {
                    this.updateScore(box.color);
                    if (box.color === 'red') {
                        this.destroySurroundingBoxes(box);
                    }
                    this.removeBox(box);
                    bullet.removeBullet();
                }
        
                // Check if there are still boxes left
                if (box && box.element) {
                    allBoxesDestroyed = false;
                }
            });
        
            // If all boxes are destroyed, create a new set of boxes
            if (allBoxesDestroyed) {
                this.createRandomBoxes();
            }
        }
        checkGunCollisions(gun) {
            const gunRect = gun.image.getBoundingClientRect();
        
            this.boxes.forEach((box) => {
                const boxRect = box.element.getBoundingClientRect();
        
                if (
                    gunRect.left < boxRect.right &&
                    gunRect.right > boxRect.left &&
                    gunRect.top < boxRect.bottom &&
                    gunRect.bottom > boxRect.top
                ) {
                    // Stop the movement of all boxes
                    this.speed = { x: 0, y: 0 };
                    // Trigger game over
                    endGame();
                }
            });
        }   
        createRandomBoxes() {
            // This function creates a new set of random boxes
            const rows = Math.floor(Math.random() * 5 + 2);
            const columns = Math.floor(Math.random() * 10 + 5);
        
            for (let x = 1; x < columns; x++) {
                for (let y = 2; y < rows; y++) {
                    let color = 'green';
                    if (Math.random() < 0.1) {
                        color = 'red';
                    }
                    const spacing = 15;
                    const boxPosition = {
                        x: x * (30 + spacing),
                        y: y * (30 + spacing),
                    };
                    this.boxes.push(new Box({
                        position: boxPosition,
                        color,
                    }));
                }
            }
        }
        destroySurroundingBoxes(targetBox) {
            const targetIndex = this.boxes.indexOf(targetBox);
            const columns = Math.floor(window.innerWidth / 45);
            const rows = Math.ceil(this.boxes.length / columns);
    
            const startX = Math.max(0, targetIndex % columns - 1);
            const endX = Math.min(columns - 1, targetIndex % columns + 1);
            const startY = Math.max(0, Math.floor(targetIndex / columns) - 1);
            const endY = Math.min(rows - 1, Math.floor(targetIndex / columns) + 1);
    
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const index = y * columns + x;
                    const box = this.boxes[index];
                    if (box && box.element && box !== targetBox) {
                        this.removeBox(box);
                    }
                }
            }
        }
        updateScore(boxColor) {
            if (boxColor === 'green') {
                score += 2;
            } else if (boxColor === 'red') {
                score += 15;
            }
            scoreDisplay.textContent = `Score: ${score}`;
            saveScore(userName, score); 
            if (score >= 300) {
                congratulateUser();
            }
        }
        removeBox(box) {
            if (box.element) {
                document.body.removeChild(box.element);
                box.element = null;
            }
            this.boxes.splice(this.boxes.indexOf(box), 1);
        }
    }
    class Gun {
        constructor(top, src, style = { width: "150px", height: "100px" }) {
            this.image = document.createElement("img");
            this.image.style.top = top;
            this.image.style.left = `${Math.floor(Math.random() * window.innerWidth)}px`;
            this.image.src = src;
            this.image.style.position = 'absolute';
            this.changeStyle(style);
            this.speed = 20;
        }
        changeStyle(object) {
            for (let key in object) {
                this.image.style[key] = object[key];
            }
        }
        appendGun(parent) {
            parent.append(this.image);
            this.container = parent;
        }
        moveLeft() {
            let left = parseInt(this.image.style.left) - this.speed;
            if (left > 0) {
                this.image.style.left = left + "px";
            }
        }
        moveRight() {
            let left = parseInt(this.image.style.left) + this.speed;
            if (left + this.image.clientWidth < window.innerWidth) {
                this.image.style.left = left + "px";
            }
        }
        fireBullet() {
            const gunRect = this.image.getBoundingClientRect();
            const gunCenterX = gunRect.left + gunRect.width / 2;
            const gunTop = gunRect.top - gunRect.height / 2;
            const bullet = new Bullet(gunCenterX + 'px', gunTop + 'px');
            bullet.appendBullet(this.container);
            bullet.moveUp();
        }
    }
    class Bullet {
        constructor(left, top, style = { width: "20px", height: "20px", backgroundColor: "red", borderRadius: "50%" }) {
            this.bullet = document.createElement("div");
            this.bullet.style.left = left;
            this.bullet.style.top = top;
            this.bullet.style.position = 'absolute';
            this.changeStyle(style);
            this.speed = 50;
        }
        changeStyle(object) {
            for (let key in object) {
                this.bullet.style[key] = object[key];
            }
        }
        appendBullet(parent) {
            parent.append(this.bullet);
            this.container = parent;
        }
        moveUp() {
            const moveInterval = setInterval(() => {
                let top = parseInt(this.bullet.style.top) - this.speed;
                if (top > 0) {
                    this.bullet.style.top = top + "px";
                    grid.checkBulletCollisions(this);
                } else {
                    clearInterval(moveInterval);
                    this.removeBullet();
                }
            }, 140);
        }
        removeBullet() {
            if (this.container.contains(this.bullet)) {
                this.container.removeChild(this.bullet);
                bullets.splice(bullets.indexOf(this), 1);
            }
        }
    }
    
    function saveScore(userName, score) {
        localStorage.setItem(`${userName}_score`, score);
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    function congratulateUser() {
        Swal.fire({
            title: 'Congratulations!',
            html: `Well done, ${userName}! You've won with a score of ${score}.`,
            icon: 'success',
            confirmButtonText: 'Return to Home Page',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'home.html';
            } 
        });
    }
    
    let gameOver = false;
    let gameOverAlertShown = false;
    
    function endGame() {
        if (gameOver) {
            return; // If the game is already over, do nothing
        }
    
        gameOver = true; 
    
        if (!gameOverAlertShown) {
            gameOverAlertShown = true;
    
            // Stop the timer
            clearInterval(gameInterval);
    
            Swal.fire({
                title: 'Game Over!',
                text: 'Game Over. Do you want to end the game?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'End Game',
                cancelButtonText: 'Return to Home Page',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'about:blank';
                    window.close();
                } else {
                    window.location.href = 'home.html';
                }
            });
        }
    }
    // Initialize score and display element
    let score = 0;
    const scoreDisplay = document.createElement('div');
    scoreDisplay.textContent = `Score: ${score}`;
    scoreDisplay.style.fontFamily = 'Arial, sans-serif';
    scoreDisplay.style.fontSize = '20px';
    scoreDisplay.style.color = 'black';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.background = 'white';
    scoreDisplay.style.borderRadius='10px';
    scoreDisplay.style.width='120px';
    scoreDisplay.style.height='30px';
    scoreDisplay.style.paddingTop='10px';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.left = '10px';
    document.body.appendChild(scoreDisplay);
    
    // Initialize timer and display element
    let timeRemaining = 120; // 2 minutes in seconds
    const timerDisplay = document.createElement('div');
    timerDisplay.textContent = `Time: ${formatTime(timeRemaining)}`;
    timerDisplay.style.fontFamily = 'Arial, sans-serif';
    timerDisplay.style.fontSize = '20px';
    timerDisplay.style.color = 'black';
    timerDisplay.style.position = 'absolute';
    timerDisplay.style.background = 'white';
    timerDisplay.style.borderRadius='10px';
    timerDisplay.style.width='120px';
    timerDisplay.style.height='30px';
    timerDisplay.style.paddingTop='10px';
    timerDisplay.style.top = '10px';
    timerDisplay.style.left = '150px';
    document.body.appendChild(timerDisplay);
    
    let grid;
    let bullets;
    let gameInterval;
    function startGame(level) {
          if (!gameStarted) {
            gameStarted = true;
    
            grid = new Grid(level);
            setInterval(() => {
              grid.update();
            }, 16);
    
            const container = document.getElementById("container");
            const gun = new Gun("80%", "/images/gun.png");
            gun.appendGun(container);
            bullets = [];
    
            // Update the game loop to check for bullet collisions
            gameInterval = setInterval(() => {
              grid.update();
              bullets.forEach((bullet) => {
                grid.checkBulletCollisions(bullet);
              });
              grid.checkGunCollisions(gun);
              // Update the timer
              timeRemaining--;
              timerDisplay.textContent = `Time: ${formatTime(timeRemaining)}`;
              // Check for game over
              if (timeRemaining <= 0) {
                clearInterval(gameInterval); // Stop the game loop
                endGame();
              }
            }, 1000);
            
            document.addEventListener("keydown", (event) => {
              if (event.key === "ArrowLeft") {
                gun.moveLeft();
              } else if (event.key === "ArrowRight") {
                gun.moveRight();
              } else if (event.key === " ") {
                event.preventDefault();
                gun.fireBullet();
              }
            });
            document.getElementById('startButtonEasy').style.display = 'none';
                document.getElementById('startButtonHard').style.display = 'none';
            document.getElementById("name").style.display = 'none';
          }
        }
        document.getElementById("startButtonEasy").addEventListener("click", () => startGame('easy'));
        document.getElementById("startButtonHard").addEventListener("click", () => startGame('hard'));   
    }