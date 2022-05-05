'use strict';

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

window.addEventListener('resize', resize);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();

const gameSpeed = 5;
const objects = [];
const events = {};
const UPDATE_TIME = 1000 / 60;
let timer = null;
const scale = 0.12;

window.addEventListener('keydown', (e) => {
  events[e.code] = true;
  moveCar();
});

window.addEventListener('keyup', (e) => {
  events[e.code] = false;
});

let player1 = {};
let player2 = {};

const PLAYER1_CARS = {
	YEllOW_CAR1: new Car("./images/yellowCar.png", canvas.width - 1460, canvas.height / 2, true, false, 15),
	RED_CAR1: new Car("./images/redCar.png", canvas.width - 1460, canvas.height / 2, true, false, 14),
	BLACK_CAR1: new Car("./images/blackCar.png", canvas.width - 1460, canvas.height / 2, true, false, 12 ),
	PURPLE_CAR1:  new Car("./images/purpleCar.png", canvas.width - 1460, canvas.height / 2, true, false, 11),
};

const PLAYER2_CARS = {
  YEllOW_CAR2: new Car("./images/yellowCar.png", canvas.width - 500, canvas.height / 2, true,false, 15),
	RED_CAR2: new Car("./images/redCar.png", canvas.width - 500, canvas.height / 2, true,false, 14),
	BLACK_CAR2: new Car("./images/blackCar.png", canvas.width - 500, canvas.height / 2, true,false, 12),
	PURPLE_CAR2: new Car("./images/purpleCar.png", canvas.width - 500, canvas.height / 2, true,false, 11),
};

const roads = [
  new Road('./images/road.png', 0),
  new Road('./images/road.png', canvas.width)
];

function start() {
  timer = setInterval(update, UPDATE_TIME);
}

function reload() {
  setTimeout(() => {
    clearInterval(timer);
    timer = null;
    location.reload();
  }, 7000);
}

function update() {
  roads[0].update(roads[1]);
  roads[1].update(roads[0]);

  player1.update();
  player2.update();

  for (let i = 0; i < objects.length; i++) {
    objects[i].update();
    if (objects[i].dead) {
      objects.splice(i, 1);
    }
  }
  let hit = false;

  for (let i = 0; i < objects.length; i++) {
    hit = player1.collision(objects[i]);
    if (hit) {
      player1.dead = true;
      break;
    }

    hit = player2.collision(objects[i]);
    if (hit) {
      player2.dead = true;
      break;
    }
  }
  draw();
  if (player1.dead) player1.isPlayer = false;
  if (player2.dead) player2.isPlayer = false;
  if (player1.dead && player2.dead) {
    endScore();
    reload();
  }
  spawnEnemies();
  moveEnemy();
}

function spawnEnemies() {
  if (randomNum(0, 10000) > 9700) {
    switch (randomNum(1, 4)) {
    case 1:
      objects.push(new Car('./images/enemyCar1.png',
        randomNum(30, canvas.width - 50), randomNum(250, 400) * -1,
        false, true, 9));
      break;
    case 2:
      objects.push(new Car('./images/enemyCar2.png',
        randomNum(30, canvas.width - 50), randomNum(250, 400) * -1,
        false, true, 9));
      break;
    case 3:
      if (player1.score >= 1000 || player2.score >= 1000) {
        objects.push(new Car('./images/enemyCarBoss1.png',
          randomNum(30, canvas.width - 50), randomNum(250, 400) * -1,
          false, true, 7));
      }
      break;
    case 4:
      if (player1.score >= 1500 || player2.score >= 1500) {
        objects.push(new Car('./images/enemyCarBoss2.png',
          randomNum(30, canvas.width - 50), randomNum(250, 400) * -1,
          false, true, 5));
      }
      break;
    }
  }
}

function moveEnemy() {
  for (const car of objects) {
    car.move('y', 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < roads.length; i++) {
    ctx.drawImage(
      roads[i].image,
      0,
      0,
      roads[i].image.width,
      roads[i].image.height,
      roads[i].x,
      roads[i].y,
      canvas.width,
      canvas.width
    );
  }

  drawCar(player1);
  drawCar(player2);

  for (let i = 0; i < objects.length; i++) {
    drawCar(objects[i]);
  }
  ctx.fillStyle = 'white';
  ctx.font = '30px Comic Sans MS';
  ctx.fillText('Счет игрока №1: ' + player1.score, 40, canvas.height - 20);
  ctx.fillText('Счет игрока №2: ' + player2.score, 1540, canvas.height - 20);
}

function drawCar(car) {
  ctx.drawImage(
    car.image,
    0,
    0,
    car.image.width,
    car.image.height,
    car.x,
    car.y,
    car.image.width * scale,
    car.image.height * scale
  );
}

function moveCar() {
  if (player1.isPlayer) {
    if (events['ArrowLeft']) {
      player1.move('x', 0);
    }
    if (events['ArrowRight']) {
      player1.move('x', 1);
    }
    if (events['ArrowUp']) {
      player1.move('y', 0);
    }
    if (events['ArrowDown']) {
      player1.move('y', 1);
    }
  }
  if (player2.isPlayer) {
    if (events['KeyA']) {
      player2.move('x', 0);
    }
    if (events['KeyD']) {
      player2.move('x', 1);
    }
    if (events['KeyW']) {
      player2.move('y', 0);
    }
    if (events['KeyS']) {
      player2.move('y', 1);
    }
  }
  if (events['Escape']) {
    if (timer === null) {
      start();
    } else {
      reload();
    }
  }
}

function randomNum(min, max) {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function endScore() {
  const congrag1 = 'Поздравляю игрок №1 набрал больше очков. Его счет:';
  const congrag2 = 'Поздравляю игрок №2 набрал больше очков. Его счет:';
  if (player1.score > player2.score) {
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(congrag1 + player1.score,
      (canvas.width - ctx.measureText(congrag1).width) / 2,
      canvas.height / 2);
  }
  if (player2.score > player1.score) {
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#00ffff';
    ctx.fillText(congrag2 + player2.score,
      (canvas.width - ctx.measureText(congrag2).width) / 2,
      canvas.height / 2);
  }
}

start();



