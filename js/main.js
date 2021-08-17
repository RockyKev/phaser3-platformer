// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function () {
    this.playerSpeed = 150;
    this.jumpSpeed = -600;

    this.debug = true;
};

// load asset files for our game
gameScene.preload = function () {
    // load images
    this.load.image('ground', 'assets/images/ground.png');
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('block', 'assets/images/block.png');
    this.load.image('goal', 'assets/images/gorilla3.png');
    this.load.image('barrel', 'assets/images/barrel.png');

    // load spritesheets
    this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
        frameWidth: 28,
        frameHeight: 30,
        margin: 1,
        spacing: 1,
    });

    this.load.spritesheet('fire', 'assets/images/fire_spritesheet.png', {
        frameWidth: 20,
        frameHeight: 21,
        margin: 1,
        spacing: 1,
    });

    this.load.json('levelData', 'assets/levels/levelData.json');
};

// executed once, after assets were loaded
gameScene.create = function () {
    this.setDebug();

    // add level elements
    this.setupLevel();

    this.setupCamera();

    this.setupSpawner();


    // So that the goal and player to not go through walls
    this.physics.add.collider([this.player, this.goal, this.barrels], this.surfaces);

    // add collision detection
    this.physics.add.overlap(this.player, [this.hazards, this.goal, this.barrels], this.restartGame, null, this);


    // allow the player to move by tying the keyboard to game
    this.cursors = this.input.keyboard.createCursorKeys();
};

gameScene.update = function () {
    // are we on the ground
    let onGround =
        this.player.body.blocked.down || this.player.body.touching.down;

    // handling left/right move
    if (this.cursors.left.isDown) {
        if (!this.player.anims.isPlaying) {
            this.player.body.setVelocityX(-this.playerSpeed);
            this.player.flipX = false;

            if (onGround) {
                this.player.anims.play('walking');
            }
        }
    } else if (this.cursors.right.isDown) {
        if (!this.player.anims.isPlaying) {
            this.player.body.setVelocityX(this.playerSpeed);
            this.player.flipX = true;

            if (onGround) {
                this.player.anims.play('walking');
            }
        }
    } else {
        this.player.body.setVelocityX(0);
        this.player.anims.stop('walking');

        if (onGround) {
            this.player.setFrame(3);
        }
    }

    // handing jump
    if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
        // give the player a velocity in Y
        this.player.body.setVelocityY(this.jumpSpeed);
        this.player.anims.stop('walking');
        this.player.setFrame(2);
    }
};

gameScene.setDebug = function () {
    if (this.debug) {
        // announce it
        console.warn('DEBUG IS ON');

        // make things draggable
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;

            console.log(dragX, dragY);
        });

        // click gives things
        // TODO: round to nearest .00
        this.input.on('pointerdown', function (pointer) {
            console.log(`you've clicked at: ${pointer.x}, ${pointer.y}`);
        });
    }
};

gameScene.setupLevel = function() {
    // create the groups
    this.surfaces = this.physics.add.staticGroup();
    this.hazards = this.physics.add.group({
        allowGravity: false,
        immovable: true,
    });

    // load json data
    this.levelData = this.cache.json.get('levelData');

    // create player
    this.player = this.add.sprite(
        this.levelData.player.x,
        this.levelData.player.y,
        'player',
        3
    );
    this.physics.add.existing(this.player, false);
    this.player.body.setCollideWorldBounds(true); // stay within the screen

    // walk animation
    this.anims.create({
        key: 'walking',
        frames: this.anims.generateFrameNames('player', {
            frames: [0, 1, 2],
        }),
        frameRate: 12,
        yoyo: true,
        repeat: -1,
    });

    // fire animation
    this.anims.create({
        key: 'fireBurning',
        frames: this.anims.generateFrameNames('fire', {
            frames: [0, 1],
        }),
        frameRate: 4,
        yoyo: true,
        repeat: -1,
    });

    // create all the platforms
    for (let platform of this.levelData.platforms) {
        let newObj;

        if (platform.tileCount == 1) {
            // create sprite
            newObj = this.add
                .sprite(platform.x, platform.y, platform.tileName)
                .setOrigin(0);
        } else {
            // get dimension of the blocks
            let tileWidth = this.textures.get(platform.tileName).get(0).width;
            let tileHeight = this.textures.get(platform.tileName).get(0).height;

            // create tile sprite
            newObj = this.add
                .tileSprite(
                    platform.x,
                    platform.y,
                    platform.tileCount * tileWidth,
                    tileHeight,
                    platform.tileName
                )
                .setOrigin(0);
        }

        // let platform = this.add.tileSprite(176, 384, 4 * 36, 1 * 30, 'block');
        // this.physics.add.existing(platform, true);

        // enable physics and make it static.
        this.physics.add.existing(newObj, true);
        this.surfaces.add(newObj);
    }

    // create all the fires
    for (let element of this.levelData.fires) {
        // let newObj = this.add.sprite(element.x, element.y, 'fire').setOrigin(0);

        let newObj = this.hazards
            .create(element.x, element.y, 'fire')
            .setOrigin(0);

        newObj.anims.play('fireBurning');
        // this.hazards.add(newObj);

        // debugging
        if (this.debug) {
            newObj.setInteractive();
            this.input.setDraggable(newObj);
        }
    }

    // goal
    this.goal = this.add
        .sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal')
        .setOrigin(0);
    this.physics.add.existing(this.goal, false);
};

gameScene.setupCamera = function() {

  this.levelData = this.cache.json.get('levelData');
  let worldWidth = this.levelData.world.bounds.width;
  let worldHeight = this.levelData.world.bounds.height

  // define world bounds
  this.physics.world.bounds.width = worldWidth;
  this.physics.world.bounds.height = worldHeight;

  // console.log({worldWidth});
  // console.log({worldHeight});

  // camera bounds
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.startFollow(this.player);

}

gameScene.setupSpawner = function() {

  this.levelData = this.cache.json.get('levelData');

  // barrel group
  this.barrels = this.physics.add.group({
    bounceY: 0.1, 
    bounceX: 1,
    collideWorldBounds: true
  })


  let spawningEvent = this.time.addEvent({
    delay: this.levelData.barrelSpawner.interval,
    loop: true,
    callbackScope: this, 
    callback: function() {
      // create a barrel
      let barrel = this.barrels.get(this.goal.x, this.goal.y, 'barrel')
      barrel.setVisible(true);
      barrel.body.enable = true;

      // set properties
      barrel.setVelocityX(this.levelData.barrelSpawner.speed);


      console.log(this.barrels.getChildren().length);

      // lifespan
      this.time.addEvent({
        delay: this.levelData.barrelSpawner.lifespan,
        repeat: 0,
        callbackScope: this,
        callback: function() {
          this.barrels.killAndHide(barrel);
          barrel.body.enable = false;
        }
      })


    }
  })


}

gameScene.restartGame = function() {

  // fade out
  this.cameras.main.fade(500);

  // when fade out completes, restart scene
  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
    this.scene.restart();
  }, this);

}

// our game's configuration
const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    scene: gameScene,
    title: 'Monster Kong',
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }, // determines speed of falling
            debug: true,
        },
        debug: this.debug,
    },
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
