# Mario Platformer


This is my changes to this project.


## How it works

The file flow is:

1. `.init` -> params
2. `.preload` -> assets/images/spritesheets
3. `.create`  -> after assets are loaded, things happen


## Specific notes

### Lesson 2:

**Scale to fit.**

The default Phaser 3 in the Zenva course is 3.9.
Current version is 3.55. 

To make the image fit screen, you do this:
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scalemanager/

```js

var config = {
    // ...
    parent: null,
    width: 1024,
    height: 768,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
    

```


### Lesson 3: 

Adding physics. 


**Creating a ground with arcade physics**
You don't need Phaser to calculate everything. 
So separate your elements between static/dynamic.


```js
  let ground = this.add.sprite(180, 400, 'ground');

  // add sprite to the physics system
  this.physics.add.existing(ground);
  ground.body.allowGravity = false;
  ground.body.immovable = true;
```

Is the same as:

```js
  let ground = this.add.sprite(180, 400, 'ground');

  // add sprite to the physics system 
  // (optional 2nd param isStatic)
  this.physics.add.existing(ground, true);
```

**Making two things collide with each other**

SINGLE ELEMENT:
```js
  // so the ground and ground2 collide.
  // ground 1 is a static 
  // ground 2 is dynamic.  
  this.physics.add.collider(ground, ground2);

```

GROUP OF ELEMENTS (sucky way):
```js

  // ground
  let ground = this.add.sprite(180, 604, 'ground');
  this.physics.add.existing(ground, true);   // add sprite to the physics system

  // platforms
  let platform = this.add.tileSprite(180, 500, 4 * 36 , 1* 30, 'block');
  this.physics.add.existing(platform, true); 

  // player 
  let player = this.add.sprite(180, 400, 'player', 3);
  this.physics.add.existing(player, false); 

    // add colliders
  this.physics.add.collider(ground, player);
  this.physics.add.collider(platform, player);
```

GROUP OF ELEMENTS (better way):
```js
    // this group has shared attributes. 
  this.surfaces = this.add.group();

  // ground
  let ground = this.add.sprite(180, 604, 'ground');
  this.physics.add.existing(ground, true);   // add sprite to the physics system
  this.surfaces.add(ground);

  // platforms
  let platform = this.add.tileSprite(180, 500, 4 * 36 , 1* 30, 'block');
  this.physics.add.existing(platform, true); 
  this.surfaces.add(platform);

  // player 
  let player = this.add.sprite(180, 400, 'player', 3);
  this.physics.add.existing(player, false); 

  this.physics.add.collider(player, this.surfaces);



```

### Lesson 4: 

**Making the player walk**

The sprites are in a single file.

```js
gameScene.preload() {
    this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
    frameWidth: 28,
    frameHeight: 30,
    margin: 1,
    spacing: 1
  });

}

gameScene.create() {

    //...
  this.anims.create({
    key: 'walking',
    frames: this.anims.generateFrameNames('player', {
      frames: [0, 1, 2],
      frameRate: 12,
      yoyo: true,
      repeat: -1
    })
  })
}

gameScene.update = function() {
  
  // controllers. 
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-100);
  } else if(this.cursors.right.isDown) {
    this.player.body.setVelocityX(100);
  } else {
    this.player.body.setVelocityX(0);
  }
}

```

For flipping, animations, etc
```js
gameScene.update = function() {
  
  if (this.cursors.left.isDown) {

      if (!this.player.anims.isPlaying) {
        this.player.body.setVelocityX(-100);
        this.player.anims.play('walking');
        this.player.flipX = false;
      }


  } else if(this.cursors.right.isDown) {

    if (!this.player.anims.isPlaying) {
      this.player.body.setVelocityX(100);
      this.player.anims.play('walking');
        this.player.flipX = true;
    }

    
  } else {
    this.player.body.setVelocityX(0);
    this.player.anims.stop('walking');
    this.player.setFrame(3);
  }
}
```

**The game loop and declaring global values**

```js
    // this is declared only within the function it was called.
    let ground = this.add.sprite(180, 604, 'ground'); 

    // this attaches the element into the entire scene. So you can use it in many places.
    this.player = this.add.sprite(180, 400, 'player', 3);

```

### Lesson 5

**Make the player jump**

```js
gameScene.update() {

  
  // Test that are we on the ground
  let onGround = this.player.body.blocked.down || this.player.body.touching.down; 

  // if you are on the ground, then fire the commands.

  // handing jump
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {

    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);
    this.player.anims.stop('walking');
    this.player.setFrame(2)

  }

}

```

### Level 6

**Creating an animation from a spritesheet**

```js 
  // fire animation    
  this.anims.create({
    key: 'fireBurning',
    frames: this.anims.generateFrameNames('fire', {
        frames: [0, 1],
    }),
      frameRate: 4,
      repeat: -1,
  });    

// then add it to your element
  newObj.anims.play('fireBurning');

```



**Making a Level with JSON**

```js
gameScene.preload = function () {
  
    this.load.json('levelData', 'assets/levels/levelData.json')
};


gameScene.create = function () {
    // load json data
    this.levelData = this.cache.json.get('levelData');

 for (let platform of this.levelData.platforms) {
        let newObj;

        if (platform.tileCount == 1) {
            // create sprite
            newObj = this.add.sprite(platform.x, platform.y, platform.tileName).setOrigin(0);
        } else {
            // get dimension of the blocks
            let tileWidth = this.textures.get(platform.tileName).get(0).width;
            let tileHeight = this.textures.get(platform.tileName).get(0).height;

            // create tile sprite
            newObj = this.add.tileSprite(
                platform.x,
                platform.y,
                platform.tileCount * tileWidth,
                tileHeight,
                platform.tileName
            ).setOrigin(0);
        }

 }
}


```

### Level 7

**Make something draggable**

```js
// debugging
newObj.setInteractive();
this.input.setDraggable(newObj);


this.input.on('drag', function(pointer, gameObject, dragX, dragY){
  gameObject.x = dragX;
  gameObject.y = dragY;

  console.log(dragX, dragY);

});
```

**Software for tiling**
Check out TILED to help you lay out levels.


### Level 8

**Optimization stategies on physics groups**
```js
    // create the groups
    this.surfaces = this.add.group();
    this.hazards = this.add.group();

    // newObj.body.allowGravity = false;
    // newObj.body.immovable = true;
```

instead go for

```js
    // create the groups
    // hazards is dynamic
    this.surfaces = this.physics.add.staticGroup();
    this.hazards = this.physics.add.group({
      gravity: false,
      immovable: true
    });

```

## Level 9 

**Create and Destroy VS reuse**

This creates a barrel. And then destroys it. 
But then it creates it again... putting it on the stack.

```js
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
      let barrel = this.barrels.create(this.goal.x, this.goal.y, 'barrel')

      // set properties
      barrel.setVelocityX(this.levelData.barrelSpawner.speed);

      // lifespan
      this.time.addEvent({
        delay: this.levelData.barrelSpawner.lifespan,
        repeat: 0,
        callbackScope: this,
        callback: function() {
          barrel.destroy();
        }
      })

    }
  })

```

This uses a `get`, which will look for it in the pull before creating a new one.

```js
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
      // let barrel = this.barrels.create(this.goal.x, this.goal.y, 'barrel')
      let barrel = this.barrels.get(this.goal.x, this.goal.y, 'barrel')

      // set properties
      barrel.setVelocityX(this.levelData.barrelSpawner.speed);

      // lifespan
      this.time.addEvent({
        delay: this.levelData.barrelSpawner.lifespan,
        repeat: 0,
        callbackScope: this,
        callback: function() {
          // barrel.destroy();
          this.barrels.killAndHide(barrel);
        }
      })

    }
  })

```