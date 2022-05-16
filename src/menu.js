'use strict';

const keyCodes = {
  KeyW: 87,
  KeyS: 83,
  ArrowUp: 38,
  ArrowDown: 40,
  Enter: 13,
};

window.Game = class {
  constructor() {
    this.canvas = document.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.setScene(IntroScene);
    this.initInput();
    this.start();
  }
  initInput() {
    this.keys = {};
    document.addEventListener('keydown', (e) => { this.keys[e.which] = true; });
    document.addEventListener('keyup', (e) => { this.keys[e.which] = false; });
  }
  checkKeyPress(keyCode) {
    const isKeyPressed = this.keys[keyCode];
    this.lastKeyState = this.lastKeyState || {};
    if (typeof this.lastKeyState[keyCode] === 'undefined') {
      this.lastKeyState[keyCode] = isKeyPressed;
      return false;
    }
    if (this.lastKeyState[keyCode] !== isKeyPressed) {
      this.lastKeyState[keyCode] = isKeyPressed;
      return isKeyPressed;
    } else {
      return false;
    }
  }
  setScene(Scene) {
    this.activeScene = new Scene(this);
  }
  update(dt) {
    this.activeScene.update(dt);
  }
  render(dt) {
    this.ctx.save();
    this.activeScene.render(dt, this.ctx, this.canvas);
    this.ctx.restore();
  }

  start() {
    let last = performance.now();
    const step = 1 / 60;
    let dt = 0;
    let now;
    const frame = () => {
      now = performance.now();
      dt += (now - last) / 1000;
      while (dt > step) {
        dt -= step;
        this.update(step);
      }
      last = now;
      this.render(dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
};

window.IntroScene = class {
  constructor(game) {
    this.logoRevealTime = 2;
    this.textTypingTime = 2;
    this.sceneDisplayTime = 6;
    this.elapsedTime = 0;
    this.bigText = 'Car-Racing';
    this.infoText = 'This is game for two players, just dodge enemies and beat your opponent';
    this.game = game;
  }
  update(dt) {
    this.elapsedTime += dt;
    if (this.elapsedTime >= this.sceneDisplayTime ||
      this.game.checkKeyPress(keyCodes.Enter)) {
      this.game.setScene(MenuScene);
    }
  }
  render(dt, ctx, canvas) {
    this.fillBackground(ctx, canvas);
    this.drawLogoText(ctx, canvas);
    this.drawTypingText(ctx, canvas);
  }
  fillBackground(ctx, canvas) {
    const backgroundImage = new Image();
    backgroundImage.src = './images/introBackground.png';
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const BOTTOM_SHIFT = 150;
    ctx.drawImage(backgroundImage,
      canvas.width / 2 - backgroundImage.width / 2,
      canvas.height / 2 - backgroundImage.height / 2 - BOTTOM_SHIFT);
  }
  drawLogoText(ctx, canvas) {
    ctx.globalAlpha = Math.min(1, this.elapsedTime / this.logoRevealTime);
    ctx.font = '80px Comic Sans MS';
    ctx.fillStyle = '#000';
    ctx.fillText(this.bigText,
      (canvas.width - ctx.measureText(this.bigText).width) / 2,
      canvas.height / 2);
  }
  drawTypingText(ctx, canvas) {
    if (this.elapsedTime >= this.logoRevealTime) {
      let textProgress = Math.min(1, (this.elapsedTime - this.logoRevealTime) / this.textTypingTime);
      ctx.font = '20px Comic Sans MS';
      ctx.fillStyle = '#000';
      const LOGO_SHIFT = 80;
      ctx.fillText(this.infoText.substr(0,
        Math.floor(this.infoText.length * textProgress)),
      (canvas.width - ctx.measureText(this.infoText).width) / 2,
      canvas.height / 2 + LOGO_SHIFT);
    }
  }
};

window.MenuScene = class {
  constructor(game) {
    this.game = game;
    this.opacityDirection = 1;
    this.menuActiveOpacity = 0;
    this.menuIndex = 0;
    this.menuTitle = 'Game Menu';
    this.menuItems = [
      'Start',
      'Garage',
      'Exit'
    ];
  }
  update(dt) {
    this.calculateMenuOpacity(dt);
    this.menuNavigation();
    this.menuItemSelected();
  }
  calculateMenuOpacity(dt) {
    const opacityValue = this.menuActiveOpacity + dt * this.opacityDirection;
    if (opacityValue > 1 || opacityValue < 0) this.opacityDirection *= -1;
    this.menuActiveOpacity += dt * this.opacityDirection;
  }
  menuNavigation() {
    if (this.game.checkKeyPress(keyCodes.KeyS) || this.game.checkKeyPress(keyCodes.ArrowDown)) {
      this.menuIndex++;
      this.menuIndex %= this.menuItems.length;
      this.menuSound();
    } else if (this.game.checkKeyPress(keyCodes.KeyW) || this.game.checkKeyPress(keyCodes.ArrowUp)) {
      this.menuIndex--;
      if (this.menuIndex < 0) this.menuIndex = this.menuItems.length - 1;
      this.menuSound();
    }
  }
  menuSound() {
    const menuSelectEffect = new Audio();
    menuSelectEffect.src = './audio/menuSelectEffect.mp3';
    menuSelectEffect.play();
  }
  menuItemSelected() {
    if (this.game.checkKeyPress(keyCodes.Enter)) {
      switch (this.menuIndex) {
      case 0: this.game.setScene(GameScene);
        break;
      case 1: this.game.setScene(Garage);
        break;
      case 2: this.game.setScene(ExitScene);
        break;
      }
    }
  }
  render(dt, ctx, canvas) {
    this.fillMenuBackground(ctx, canvas);
    this.drawMenuTitle(ctx, canvas);
    this.drawMenuItems(ctx, canvas);
  }
  fillMenuBackground(ctx, canvas) {
    const backgroundImage = new Image();
    backgroundImage.src = './images/menuBackground.png';
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0);
  }
  drawMenuTitle(ctx, canvas) {
    ctx.font = '60px Comic Sans MS';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00ffff';
    const TOP_SHIFT = 10;
    ctx.fillText(this.menuTitle,
      (canvas.width - ctx.measureText(this.menuTitle).width) / 2,
      TOP_SHIFT);
  }
  drawMenuItems(ctx, canvas) {
    const itemHeight = 50;
    const fontSize = 30;
    ctx.font = fontSize + 'px Comic Sans MS';
    for (const [index, item] of this.menuItems.entries()) {
      if (index === this.menuIndex) {
        ctx.globalAlpha = this.menuActiveOpacity;
        ctx.fillStyle = '#089cd3';
        ctx.fillRect(0,
          canvas.height / 2 + index * itemHeight,
          canvas.width, itemHeight);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillText(item,
        (canvas.width - ctx.measureText(item).width) / 2,
        canvas.height / 2 + index * itemHeight + (itemHeight - fontSize) / 2);
    }
  }
};

window.GameScene = function gameStart() {
  window.open('game.html', '_self');
};

window.Garage = function openGarage() {
  window.open('garage.html', '_self');
};

window.ExitScene = class {
  update(dt) {}
  render(dt, ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gameOverText = 'Thanks for playing my game';
    ctx.textBaseline = 'top';
    ctx.font = '100px Comic Sans MS';
    ctx.fillStyle = '#089cd3';
    const BOTTOM_SHIFT = 50;
    ctx.fillText(gameOverText,
      (canvas.width - ctx.measureText(gameOverText).width) / 2,
      canvas.height / 2 - BOTTOM_SHIFT);
  }
};

// launch game
const game = new Game();
