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
