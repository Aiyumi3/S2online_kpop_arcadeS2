let score = 0;
let hearts = 24;
let gameOver = false;
let player, startplay, stars, bombs, platforms, movingPlatform, movingPlatform2, movingPlatform3, 
    scoreText, bullet1, heartsText, btnUp, btnLeft, btnRight, mousePointer, btn, tween, fly,
    backgroundSound, bombsound, soundbullet, cam, heal, sky, snooze1, snooze2, snooze3, wm1, wm2, wm3, progress;

class KPopGame extends Phaser.Scene {
    constructor () {super();}

    preload () {
        let width = this.cameras.main.width;
        let height = this.cameras.main.height;

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);//color, transparency
        progressBox.fillRoundedRect(width / 2 - 165, height / 2 - 15, 320, 50, 11);//(x, y, w, h, radius)

        let loadingText = this.make.text({
            x: width / 2 + 10,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        let percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 19,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        let assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xe0faa5, 1);
            progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 5, 300 * value, 30, 7);//(x, y, w, h, radius)
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        this.load.image('startplay', './assets/startplay.jpg');
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
        this.load.image('fullscreen', './assets/fullscreen.png');
        this.load.image('watermelon', './assets/wm.PNG');
        this.load.image('healing', './assets/healing.png');
        this.load.spritesheet('mark', './assets/dude.png', { frameWidth: 63.3, frameHeight: 93 });
        this.load.audio('background', ['./assets/audio/nctdream_hotsouce_dinover.mp3']);
        this.load.audio('bombsound', ['./assets/audio/bombsound.wav']);
        this.load.audio('soundbullet', ['./assets/audio/soundbullet.wav']);
    }

    create () {
        sky = this.add.image(0, 0, 'sky').setOrigin(0).setScrollFactor(1);       //  background for game

        mousePointer = this.input.activePointer;

        startplay = this.add.image(609, 360, 'startplay').setInteractive();
        startplay.setScrollFactor(0); // is fixed to cam
        startplay.setScale(0.3);  //smaller
        startplay.setDepth(1); //on top
        startplay.on('pointerdown', function(){
            this.setTint(0xe0faa5);
        });
        startplay.on('pointerup', function(){
            this.clearTint();
            startplay.setVisible(false);
        });

        cam = this.cameras.main;
        cam.setBounds(0, 0, 1207, 720);
        cam.setZoom(3.5); //zoom in

        backgroundSound =  this.sound.add('background', {
            volume: 0.07,
            loop: true
        });
        if(!this.sound.locked){
            // already unlocked so play
            backgroundSound.play();
        }else{
            // wait for 'unlocked' and then play
            this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                backgroundSound.play();
            });
        }
        soundbullet = this.sound.add('soundbullet', {
            volume: 0.3
        });
        bombsound = this.sound.add('bombsound', {
            volume: 0.3
        });

        platforms = this.physics.add.staticGroup();                        //  create platforms
        platforms.create(390, 677, 'ground').setScale(3).refreshBody();
        platforms.create(1000, 677, 'ground').setScale(3).refreshBody();
        platforms.create(250, 440, 'ground1');
        platforms.create(70, 600, 'ground2');
        platforms.create(580, 530, 'ground2');
        platforms.create(100, 239, 'ground2');
	platforms.create(200, 239, 'ground2');
        snooze1 = platforms.create(200, 239, 'ground1');
	platforms.create(973, 258, 'ground2');
        snooze2 = platforms.create(1050, 258, 'ground1');
        snooze3 = platforms.create(1099, 409, 'ground2');
        platforms.create(750, 140, 'ground1');
        fly = platforms.create(433, 370, 'ground2');

        this.tweens.add({
            targets: snooze1,
            alpha: 0,
            ease: 'Power1',
            duration: 700,
            yoyo: true,
            repeat: -1
        });
        this.tweens.add({
            targets: snooze2,
            alpha: 0,
            ease: 'Power1',
            duration: 400,
            yoyo: true,
            repeat: -1
        });
	this.tweens.add({
            targets: snooze3,
            alpha: 0,
            ease: 'Power1',
            duration: 170,
            yoyo: true,
            repeat: -1
        });
		
        movingPlatform = this.physics.add.image(207, 239, 'ground2');
        movingPlatform.setImmovable(true);
        movingPlatform.body.allowGravity = false;                             // <--> moving platform

        movingPlatform2 = this.physics.add.image(900, 573, 'ground2');
        movingPlatform2.setImmovable(true);
        movingPlatform2.body.allowGravity = false;                            // |^ moving platform

        bullet1 = this.physics.add.image(700, 580, 'bullet').setOrigin(0);
        bullet1.setScale(0.4);
        bullet1.setBounce(0.2);
        bullet1.body.allowGravity = false;
        bullet1.setCollideWorldBounds(true);
        tween = this.tweens.add({
            targets: bullet1,
            x: 1100,
            ease: 'Power1',
            duration: 500,
            flipX: true,
            yoyo: true,
            repeat: -1
        });

        movingPlatform3 = this.physics.add.image(770, 395, 'ground2');
        movingPlatform3.setImmovable(true);
        movingPlatform3.body.allowGravity = false;                              // <--> moving platform

        player = this.physics.add.sprite(270, 520, 'mark');
        player.setBounce(0.2);                                                   //  a slight bounce
        player.setScale(0.7);                                                    //smaller
        player.setCollideWorldBounds(true);                                      //border's limit
        cam.startFollow(player, true, 0.07, 0.07);

        this.anims.create({                                                      //  player animations
            key: 'left',
            frames: [ { key: 'mark', frame: 1 }, { key: 'mark', frame: 2 }, { key: 'mark', frame: 3 }],
            frameRate: 17,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'mark', frame: 4 }, { key: 'mark', frame: 6 }],
            frameRate: 7,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: [ { key: 'mark', frame: 5 }, { key: 'mark', frame: 6 }, { key: 'mark', frame: 7 }],
            frameRate: 17,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: [ { key: 'mark', frame: 4 }, { key: 'mark', frame: 5 }, { key: 'mark', frame: 3 }],
            frameRate: 20,
            repeat: -1
        });

        this.physics.add.collider(player, platforms);                        //  collide with the platforms
        this.physics.add.collider(player, movingPlatform);
        this.physics.add.collider(player, movingPlatform2);
        this.physics.add.collider(player, movingPlatform3);
        this.physics.add.collider(player, snooze1, fallDown, null, this);
        this.physics.add.collider(player, snooze2, fallDown, null, this);
        this.physics.add.collider(player, snooze3, fallDown, null, this);
	this.physics.add.collider(player, fly, flyUp, null, this);
        this.physics.add.collider(platforms, bullet1);
        this.physics.add.collider(player, bullet1, hitBullet, null, this);
		
	function fallDown(player){
	    player.setVelocityY(333);
	    player.body.setDragY(200);
            player.y += 50;
            player.anims.play('run');
	}
	function flyUp(player){
            player.setVelocity(-100, -333);
            player.body.setDragY(-200);
            player.y -= 50;
	    player.x -= 30;
            player.anims.play('left');
	}

        btn = this.add.image(443, 453, 'fullscreen').setInteractive(); //can tap
        btn.setScale(0.15);         //smaller
        btn.setAlpha(0.5);
        btn.setScrollFactor(0); //is fixed to camera
        btn.on('pointerup', function () {
            if(this.scale.isFullscreen){
                this.scale.stopFullscreen();
                btn.setScale(0.25);             //smaller
                btn.setAlpha(0.5);
            }else{
                this.scale.startFullscreen();
                btn.setScale(0.19);                                                    //smaller
                btn.setAlpha(0.7);
            }
        }, this);

        btnLeft = this.add.image(487, 430, 'leftBtn').setInteractive();
        btnLeft.setScale(0.65);
        btnLeft.setAlpha(0.5);
        btnLeft.setScrollFactor(0); //is fixed to camera
        btnLeft.on('pointerdown', function(){
            this.setTint(0xe0faa5);
            this.setAlpha(0.7);
            this.setScale(0.75);
            player.setVelocityX(-210);
            player.anims.play('left');
        });
        btnLeft.on('pointerup', function(){
            this.clearTint();
            this.setAlpha(0.5);
            this.setScale(0.65);
            player.setVelocityX(0);
            player.anims.play('turn');
        });

        btnRight = this.add.image(531, 430, 'rightBtn').setInteractive();
        btnRight.setScale(0.65);
        btnRight.setAlpha(0.5);
        btnRight.setScrollFactor(0); //is fixed to camera
        btnRight.on('pointerdown', function(){
            this.setTint(0xe0faa5);
            this.setAlpha(0.7);
            this.setScale(0.75);
            player.setVelocityX(210);
            player.anims.play('right');
        });
        btnRight.on('pointerup', function(){
            this.clearTint();
            this.setAlpha(0.5);
            this.setScale(0.65);
            player.setVelocityX(0);
            player.anims.play('turn');
        });

        btnUp = this.add.image(727, 430, 'upBtn').setInteractive();
        btnUp.setScale(0.65);
        btnUp.setAlpha(0.5);
        btnUp.setScrollFactor(0); //is fixed to camera
        btnUp.on('pointerdown', function(){
            this.setTint(0xe0faa5);
            this.setAlpha(0.7);
            this.setScale(0.75);
            player.setVelocityY(-295);
            player.anims.play('run');
        });
        btnUp.on('pointerup', function(){
            this.clearTint();
            this.setAlpha(0.5);
            this.setScale(0.65);
            player.setVelocityX(0);
            player.anims.play('turn');
        });

        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,                                                         //in total = 12
            setXY: { x: 65, y: Phaser.Math.Between(3, 525), stepX: 107 }
        });
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));          // a slightly different bounce for each watermelon
            child.setCollideWorldBounds(true);
            child.setScale(0.5);
        });
        bombs = this.physics.add.group();

        heartsText = this.add.text(725, 255, '💚: 24', { fontSize: '9pt', fill: '#c6f50c', fontFamily:'Comic Sans MS',
            stroke: 'rgba(194,86,222,0.94)', strokeThickness: 3});
        heartsText.setScrollFactor(0); //is fixed to camera
        heartsText.setShadow(2, 2,'#2a031b', 1, false, true);

        scoreText = this.add.text(437, 255, 'score: 0', { fontSize: '9pt', fill: '#c6f50c', fontFamily:'Comic Sans MS',
            stroke: 'rgba(194,86,222,0.94)', strokeThickness: 3});
        scoreText.setScrollFactor(0); //is fixed to camera
        scoreText.setShadow(2, 2,'#2a031b', 1, false, true);

        heal = this.add.image(763, 282, 'healing').setInteractive();
        heal.setScale(0.017);
        heal.setScrollFactor(0); //is fixed to camera
        heal.setVisible(false);
        heal.on('pointerdown', function(){
            this.setTint(0xe0faa5);
            this.setScale(0.08);

            if(hearts >= 17 && hearts <= 24){
                hearts += 1.5;
                heartsText.setText(`💚: ${hearts}`);
            }else if(hearts < 9){
                hearts += 5;
                heartsText.setText(`💚: ${hearts}`);
            }else if(hearts >= 9 && hearts < 17){
                hearts += 3;
                heartsText.setText(`💚: ${hearts}`);
            }
        });
        heal.on('pointerup', function(){
            this.clearTint();
            this.setScale(0.017);
            this.setVisible(false);
        });

        progress = this.add.graphics().setScrollFactor(0); //is fixed to camera;
        wm1 = this.add.image(591, 268, 'watermelon').setScale(0.011).setScrollFactor(0); //is fixed to camera
        wm2 = this.add.image(652, 268, 'watermelon').setScale(0.011).setScrollFactor(0); //is fixed to camera
        wm3 = this.add.image(709, 268, 'watermelon').setScale(0.011).setScrollFactor(0); //is fixed to camera

        this.physics.add.collider(stars, movingPlatform);
        this.physics.add.collider(stars, movingPlatform2);
        this.physics.add.collider(stars, movingPlatform3);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(bombs, movingPlatform);
        this.physics.add.collider(bombs, movingPlatform2);
        this.physics.add.collider(bombs, movingPlatform3);
        this.physics.add.overlap(player, stars, collectStar, null, this);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        function hitBullet(player, bullet){
            player.setTint(0x8B0634);
            player.anims.play('turn');
            if(!this.sound.locked){
                // already unlocked so play
                soundbullet.play();
            }else{
                // wait for 'unlocked' and then play
                this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                    soundbullet.play();
                });
            }
            setInterval(() => {
                player.clearTint();
            }, 3000);

            hearts -= 3;
            heartsText.setText(`💚: ${hearts}`);
            if(bullet.x >= 700){
                player.x = 500;
            }else if(bullet.y > 580){
                bullet.y = 580;
            }

            if(hearts < 0){
                hearts = 0;
                heartsText.setText(`💚: ${hearts}`);
            }

            if(hearts === 0){
                bullet.disableBody(true, true);
                player.setTint(0x8B0634);
                this.physics.pause();
                gameOver = true;

                if(this.scale.isFullscreen){
                    this.scale.stopFullscreen();
                }

                Swal.fire({
                    title: `😢📢Game over✨🥴🎊\n🌸~ your score: ${score} ~🌸`,
                    icon: 'warning',
                    confirmButtonColor: '#a7fa5a',
                    confirmButtonText: '~reload~'
                }).then(() => {location.reload();})
            }
        }

        function collectStar(player, star){
            star.disableBody(true, true);
            score += 5;
            scoreText.setText(`score: ${score}`);

            if(stars.countActive(true) === 0){
                stars.children.iterate(function(child){
                    //  new watermelons
                    child.enableBody(true, child.x, Phaser.Math.Between(3, 525), true, true);
                });

                let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                let bomb = bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setScale(0.2); //smaller
                bomb.setVelocity(Phaser.Math.Between(-120, 90), 20);
                bomb.allowGravity = false;
                bomb.setCollideWorldBounds(true);
                setInterval(() => {
                    bomb.disableBody(true, true);
                }, 19703);
            }
        }

        function hitBomb(player, bomb){
            player.setTint(0x8B0634);
            setInterval(() => {
                player.clearTint();
            }, 2500);
            if(!this.sound.locked){
                // already unlocked so play
                bombsound.play();
            }else{
                // wait for 'unlocked' and then play
                this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {bombsound.play();});
            }
            player.anims.play('turn');
            bomb.disableBody(true, true);

            score -= 35;
            hearts -= 0.5;
            scoreText.setText(`score: ${score}`);
            heartsText.setText(`💚: ${hearts}`);

            if(hearts < 0){
                hearts = 0;
                heartsText.setText(`💚: ${hearts}`);
            }

            if(hearts === 0 || btn.y > 700 || player.y > 700){
                player.setTint(0x8B0634);
                this.physics.pause();
                gameOver = true;

                if(this.scale.isFullscreen){
                    this.scale.stopFullscreen();
                }

                Swal.fire({
                    title: `🎈📢Game over✨😟 \n🌸~ your score: ${score} ~🌸`,
                    icon: 'warning',
                    confirmButtonColor: '#a7fa5a',
                    confirmButtonText: '~reload~'
                }).then(() => {location.reload();})
            }
        }
    }

    update () {
        if(gameOver){
            return;//allows to show alert
        }

        if((score > 562 && score < 600) || (hearts <= 12 && hearts > 5)){
            heal.setVisible(true);
        }
        if(hearts >= 24){
            hearts = 24;
            heartsText.setText(`💚: ${hearts}`);
            heal.setVisible(false);
        }

        progress.clear();
        const size = 200; //width rect
        let sizeCh = (size*score)/3425;

        progress.fillStyle(0x463b66, 0.5);
        progress.fillRoundedRect(512, 263, size, 12, 3); //(x, y, w, h, radius)

        progress.fillStyle(0xb2f731, 0.9);
        progress.fillRect(514, 264.5, sizeCh, 9);

        if(score >= 3425){
            this.physics.pause();
            gameOver = true;
            Swal.fire({ // alert
                title: `🎊🎶📢Winner💫✨😊 \n🌸~ your score: ${score} ~🌸 \n 🍈 🍈 🍈 \n 💚: ${hearts}`,
                icon: 'success',
                confirmButtonColor: '#a7fa5a',
                confirmButtonText: '~reload~'
            }).then(() => { location.reload(); })
        }

        if(movingPlatform.x >= 600){
            movingPlatform.setVelocityX(-193);
        }else if(movingPlatform.x <= 310){
            movingPlatform.setVelocityX(500);
        }

        if(movingPlatform3.x >= 770){
            movingPlatform3.setVelocityX(-290);
        }else if(movingPlatform3.x <= 520){
            movingPlatform3.setVelocityX(77);
        }

        if(movingPlatform2.y >= 555){
            movingPlatform2.setVelocityY(-340);
        }else if(movingPlatform2.y <= 200){
            movingPlatform2.setVelocityY(131);
        }
		
	fly.rotation -= 0.5;

    }
}

const config = {
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
    backgroundColor: '#1d0126',
    scene: [ KPopGame ]
};
const game = new Phaser.Game(config);
