// Initialize Phaser, and create a game canvas
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// Create main state that will contain the game

var mainState = {

    preload: function() {
        game.stage.backgroundColor = '#71c5cf';
        
        // Load the bird sprite
        game.load.image('bird', 'assets/bird.png');
        
        // Load the pipe sprite
        game.load.image('pipe', 'assets/pipe.png');
        
        // Load the sound
        game.load.audio('jump', 'assets/jump.wav');
        
        this.pipes = game.add.group(); // Create a group
        this.pipes.enableBody = true; // Add physics to the group
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes
    },
    
    create: function() {
        // Called after preload
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');
        
        // Add gravity to make the bird fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;
        
        // Call the 'jump' function when user hits space or clicks left mouse button
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        this.game.input.onDown.add(this.jump, this);
        
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        
        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff"});
        
        // Change anchor of bird so rotation is smoother
        this.bird.anchor.setTo(-0.2, 0.5);
        
        this.jumpSound = game.add.audio('jump');
        
    },
    
    update: function() {
        // Called up to 60 times per second
        
        // If the bird goes off the canvas, restart game
        if (this.bird.inWorld == false) {
            this.restartGame();
        }
        
        // Restart game if the bird hits a pipe
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        
        if (this.bird.angle < 20) {
            this.bird.angle += 1;
        }
    },
    
    jump: function() {
        // Dead birds don't jump
        if (this.bird.alive == false) {
            return;
        }
        
        this.jumpSound.play();
        
        // Add vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        
        // Start animation to change angle of bird to -20 in 100ms
        game.add.tween(this.bird).to({angle: -20}, 100).start();                
    },
    
    restartGame: function() {
        game.state.start('main');
    },
    
    addOnePipe: function(x, y) {
        // Get the first "dead" pipe from the group
        var pipe = this.pipes.getFirstDead();
        
        // Set the new position of the pipe
        pipe.reset(x, y);
        
        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;
        
        // Kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    
    addRowOfPipes: function() {
        // Pick random spot for a hole
        var hole = Math.floor(Math.random() * 5) + 1;
        
        // Add the pipes
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(400, i * 60 + 10);
            }
        }
        
        this.score += 1;
        this.labelScore.text = this.score;
    },
    
    hitPipe: function() {
        // If bird has already hit a pipe, do nothing
        if (this.bird.alive == false) {
            return;
        }
        
        // Kill the bird
        this.bird.alive = false;
        
        // Prevent new pipes from appearing
        this.time.events.remove(this.timer);
        
        // Go through each of the pipes and stop their movement
        this.pipes.forEachAlive(function(p) {
            p.body.velocity.x = 0;
        }, this);
    },

};

// Add and start the main state to start the game
game.state.add('main', mainState);
game.state.start('main');

