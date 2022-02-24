Swal.fire({
    imageUrl: './assets/mark_dino.jpg',
    imageWidth: 180,
    imageHeight: 206,
    imageAlt: 'game',
    title: 'loading...',
    allowEscapeKey: false,
    allowOutsideClick: false,
    timer: 90000,
    timerProgressBar: true,
    didOpen: () => {
        Swal.showLoading()
        const b = Swal.getHtmlContainer().querySelector('b')
        timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft()
        }, 100)
    },
    willClose: () => {
        clearInterval(timerInterval)
    }
}).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
        Swal.fire({
            title: 'Finished!',
            icon: "success",
            timer: 900,
            showConfirmButton: false
        })
    }
})

const config = {    //1207, 720
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1207,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    input: {
        touch: {
            capture: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
const game = new Phaser.Game(config);

let score = 0;
let hearts = 24;
let gameOver = false;
let player, stars, bombs, platforms, movingPlatform, movingPlatform2, movingPlatform3, cursors, scoreText, bullet1, heartsText, 
    btnUp, btnLeft, btnRight, mousePointer, btn, tween;

function preload () {
    this.load.image('sky', './assets/sky.jpg');
    this.load.image('ground', './assets/platform.png');
    this.load.image('ground1', './assets/platformHalf.png');
    this.load.image('ground2', './assets/platformShort.png');
    this.load.image('star', './assets/star.png');
    this.load.image('bomb', './assets/bomb.png');
    this.load.image('leftBtn', './assets/left.png');        //btns
    this.load.image('rightBtn', './assets/right.png');
    this.load.image('upBtn', './assets/up.png');
    this.load.image('bullet', './assets/bullet-bill.png');
    this.load.image('cannon', './assets/cannon.png');
    this.load.spritesheet('mark', './assets/dude.png', { frameWidth: 63.3, frameHeight: 93 });
}

function create () {
    this.cameras.main.setBounds(0, 0, 1207, 720);
    this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(1);               //  background for game

    cursors = this.input.keyboard.createCursorKeys();                          //  input events
    mousePointer = this.input.activePointer;

    platforms = this.physics.add.staticGroup();                               //  create platforms
    platforms.create(390, 677, 'ground').setScale(3).refreshBody();
    platforms.create(1000, 677, 'ground').setScale(3).refreshBody();
    platforms.create(250, 440, 'ground1');
    platforms.create(70, 600, 'ground2');
    platforms.create(580, 530, 'ground2');
    platforms.create(770, 395, 'ground2');
    platforms.create(100, 239, 'ground2');
    platforms.create(200, 239, 'ground2');
    platforms.create(973, 258, 'ground2');
    platforms.create(1099, 409, 'ground2');
    platforms.create(750, 140, 'ground1');
    platforms.create(433, 320, 'ground2');

    this.anims.create({
        key: 'snooze',
        frames: [{ key: 'ground2' }, { key: 'ground1' }, { key: 'ground2' }, { key: 'ground1', duration: 15 }],
        frameRate: 8,
        repeat: -1
    });
    this.add.sprite(200, 239, 'ground2').play('snooze');                      //platform animation
    this.add.sprite(973, 258, 'ground2').play('snooze');
    this.add.sprite(1099, 409, 'ground2').play('snooze');

    movingPlatform = this.physics.add.image(207, 239, 'ground2');
    movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;                                         // <--> moving platform

    movingPlatform2 = this.physics.add.image(900, 549, 'ground2');
    movingPlatform2.setImmovable(true);
    movingPlatform2.body.allowGravity = false;                                         // |^ moving platform

    bullet1 = this.physics.add.image(700, 580, 'bullet').setOrigin(0);
    bullet1.setScale(0.4);
    bullet1.setBounce(0.2);
    bullet1.body.allowGravity = false;
    bullet1.setCollideWorldBounds(true);
    tween = this.tweens.add({
        targets: bullet1,
        x: 1100,
        ease: 'Power1',
        duration: 3000,
        flipX: true,
        yoyo: true,
        repeat: -1
    });

    movingPlatform3 = this.physics.add.image(770, 395, 'ground2');
    movingPlatform3.setImmovable(true);
    movingPlatform3.body.allowGravity = false;                                         // <--> moving platform

    player = this.physics.add.sprite(270, 520, 'mark');
    player.setBounce(0.2);                                                   //  a slight bounce
    player.setScale(0.7);                                                    //smaller
    player.setCollideWorldBounds(true);                                      //border's limit
    this.cameras.main.startFollow(player, true, 0.04, 0.04);
    this.cameras.main.followOffset.set(-100, 0);
    this.cameras.main.setZoom(2);

    this.anims.create({                                                      //  player animations
        key: 'left',
        frames: this.anims.generateFrameNumbers('mark', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [ { key: 'mark', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('mark', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('mark', { start: 3, end:5  }),
        frameRate: 10,
        repeat: -1
    });

    btn = this.add.sprite(player.x-120, player.y+100, 'upBtn').setInteractive();
    btn.setScale(0.17);                                                      //smaller
    btn.setAlpha(0.5);
    btn.on('pointerup', function () {
        if (this.scale.isFullscreen){
            this.scale.stopFullscreen();
        }else{
            this.scale.startFullscreen();
        }
    }, this);

    btnLeft = this.add.sprite(btn.x+70, btn.y, 'leftBtn').setInteractive();
    btnLeft.setScale(0.8);
    btnLeft.setAlpha(0.5);
    btnLeft.on('pointerdown', function(){
        this.setTint(0x8b0634);
        player.setVelocityX(-160);
        player.x -= 50;
        player.toggleFlipX();
    });
    btnLeft.on('pointerup', function(){
        this.clearTint();
    });

    btnRight = this.add.sprite(btnLeft.x+70, btn.y, 'rightBtn').setInteractive();
    btnRight.setScale(0.8);                                                    //smaller
    btnRight.setAlpha(0.5);
    btnRight.on('pointerdown', function(){
        this.setTint(0x8b0634);
        player.setVelocityX(160);
        player.x += 50;
        player.toggleFlipX();
    });
    btnRight.on('pointerup', function(){
        this.clearTint();
    });

    btnUp = this.add.sprite(btnRight.x+190, btn.y, 'upBtn').setInteractive();
    btnUp.setScale(0.8);
    btnUp.setAlpha(0.5);
    btnUp.on('pointerdown', function(){
        this.setTint(0x8b0634);
        player.setVelocityY(-290);
        player.y -= 57;
    });
    btnUp.on('pointerup', function(){
        this.clearTint();
    });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,                                                         //in total = 12
        setXY: { x: 65, y: 3, stepX: 107 }
    });
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));            // a slightly different bounce for each watermelon
        child.setCollideWorldBounds(true);
        child.setScale(0.6);
    });

    bombs = this.physics.add.group();
    heartsText = this.add.text(player.x, player.y-70, '💚: 24', { fontSize: '10pt', fill: '#ccff99', fontFamily:'Comic Sans MS'});
    scoreText = this.add.text(player.x, player.y-90, 'score: 0', { fontSize: '12pt', fill: '#ccff99', fontFamily:'Comic Sans MS'});
    heartsText.setScale(0.7);
    scoreText.setScale(0.7);

    this.physics.add.collider(player, platforms);                        //  collide with the platforms
    this.physics.add.collider(player, movingPlatform);
    this.physics.add.collider(player, movingPlatform2);
    this.physics.add.collider(player, movingPlatform3);
    this.physics.add.collider(stars, movingPlatform);
    this.physics.add.collider(stars, movingPlatform2);
    this.physics.add.collider(stars, movingPlatform3);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, movingPlatform);
    this.physics.add.collider(bombs, movingPlatform2);
    this.physics.add.collider(bombs, movingPlatform3);

    this.physics.add.collider(player, bullet1, hitBullet, null, this);
    this.physics.add.collider(platforms, bullet1);

    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update () {
    if (gameOver) {return;}

    const textXY = () => {
        heartsText.x = player.x;
        heartsText.y = player.y-70;
        scoreText.x = player.x;
        scoreText.y = player.y-90;
    };
    const btnXY = () => {
        if(player.x < 100 ){
            btn.x = player.x+12;
            btn.y = player.y+100;
            btnLeft.x = btn.x+70;
            btnLeft.y = btn.y;
            btnUp.x = btnRight.x+190;
            btnUp.y = btn.y;
            btnRight.x = btnLeft.x+70;
            btnRight.y = btn.y;
        }else if(player.x > 1000){
            btn.x = player.x-12;
            btn.y = player.y+100;
            btnLeft.x = btn.x-70;
            btnLeft.y = btn.y;
            btnUp.x = btnRight.x-190;
            btnUp.y = btn.y;
            btnRight.x = btnLeft.x-70;
            btnRight.y = btn.y;
        }else{
            btn.x = player.x-120;
            btn.y = player.y+100;
            btnLeft.x = btn.x+70;
            btnLeft.y = btn.y;
            btnUp.x = btnRight.x+190;
            btnUp.y = btn.y;
            btnRight.x = btnLeft.x+70;
            btnRight.y = btn.y;
        }
    };

    if(cursors.left.isDown){
        player.setVelocityX(-160);
        player.anims.play('left', true);
        textXY();
        btnXY();
        this.cameras.main.followOffset.x = 165;
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        textXY();
        btnXY();
        this.cameras.main.followOffset.x = -165;
    }else if(cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        player.anims.play('run', true);
        textXY();
        btnXY();
    }else {
        player.setVelocityX(0);
        player.anims.play('turn');
        textXY();
        btnXY();
    }

    if (movingPlatform.x >= 600) {
        movingPlatform.setVelocityX(-50);
    } else if (movingPlatform.x <= 310 ) {
        movingPlatform.setVelocityX(50);
    }

    if (movingPlatform3.x >= 800) {
        movingPlatform3.setVelocityX(-50);
    } else if (movingPlatform3.x <= 500) {
        movingPlatform3.setVelocityX(50);
    }

    if (movingPlatform2.y >= 450) {
        movingPlatform2.setVelocityY(-50);
    } else if (movingPlatform2.y <= 270) {
        movingPlatform2.setVelocityY(50);
    }
}

function collectStar (player, star) {
    star.disableBody(true, true);
    score += 15;
    scoreText.setText(`score: ${score}`);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {                         //  new watermelons
            child.enableBody(true, child.x, 0, true, true);
        });

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setScale(0.4);                                              //smaller
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
        bomb.setCollideWorldBounds(true);
    }
}

function hitBullet(player, bullet){
    player.setTint(0x8B0634);
    setInterval(() => {
        player.clearTint();
    }, 3000);
    hearts -= 3;
    heartsText.setText(`💚: ${hearts}`);
    if(bullet.x >= 700) {
        player.x = 500;
    }else if(bullet.y > 580) {
        bullet.y = 580;
    }
    
    if (hearts < 0) {
        hearts = 0;
        heartsText.setText(`💚: ${hearts}`);
    }

    if (hearts === 0) {
        player.anims.play('turn');
        bullet.disableBody(true, true);
        player.setTint(0x8B0634);
        this.physics.pause();
        gameOver = true;
        
        if (this.scale.isFullscreen){
            this.scale.stopFullscreen();
        }

        Swal.fire({
            title: `✨😢📢Game over✨🥴🎊 🌸~ your score: ${score}, hearts: ${hearts} ~🌸`,
            icon: "success",
            confirmButtonColor: '#a7fa5a',
            confirmButtonText: '~reload~'
        }).then(() => {location.reload();})
    }
}

function hitBomb (player, bomb) {
    player.setTint(0x8B0634);
    setInterval(() => {
        player.clearTint();
    }, 1507);
    player.anims.play('turn');
    bomb.disableBody(true, true);

    score -= 65.02;
    score.toFixed(2);
    hearts -= 0.5;
    scoreText.setText(`score: ${score}`);
    heartsText.setText(`💚: ${hearts}`);
    
    if (hearts < 0) {
        hearts = 0;
        heartsText.setText(`💚: ${hearts}`);
    }

    if (hearts === 0 || btn.y > 700 || player.y > 700) {
        player.setTint(0x8B0634);
        this.physics.pause();
        gameOver = true;

        Swal.fire({
            title: `✨🎈📢Game over✨🎊🎉 🌸~ your score: ${score} ~🌸`,
            icon: "success",
            confirmButtonColor: '#a7fa5a',
            confirmButtonText: '~reload~'
        }).then(() => {location.reload();})
    }
}
