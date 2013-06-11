function init() {

// global variables
var paused = true;
var okReset = false;
var okDrawBall = true;
var okGetBallDest = true;
var okFlashBoard = false;
var flashCount = 101;
var ball = {};
var pointTo = '';
var points = [0, 0];
var mousePos = 180;
var paddlePos = 150;
var AIPos = 150;
var AISpeed = 3+Math.random()*2;
var ballDest = 175;

// audio
var playerPaddleSound = document.getElementById('playerPaddleSound');
var AIPaddleSound = document.getElementById('AIPaddleSound');
var playerScoreSound = document.getElementById('playerScoreSound');
var AIScoreSound = document.getElementById('AIScoreSound');
var tableBounceSound = document.getElementById('tableBounceSound');

// event listeners
var cancan = document.getElementById('cancan');
cancan.addEventListener('mousemove', function(evt) {
		mousePos = getMousePos(evt);
	}, false);
cancan.addEventListener('mousedown', function() {
	if ((points[0] < 100) && (points[1] < 100)) {
		if (!paused) {
			paused = true;
			drawPause();
		}	else {
			paused = false;
			drawPause();
			gameLoop();
		}
	}
}, false);

// Determine the means of animation considering the browser.
window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(gameLoop) {
			window.setTimeout(gameLoop, 1000/60);
		};
})();

// Let's get started!
drawBoard();
drawPlayerPaddle();
setBall();
drawAIPaddle();
drawPause();

function gameLoop() {
	if (!paused && (points[0] < 100) && (points[1] < 100)) {
		drawPlayerPaddle();
		drawAIPaddle();
		drawBall();
		reset();
		flashBoard();
		window.requestAnimFrame(gameLoop);
	}
	if (points[0] == 100 || points[1] == 100) endGame();
}

function reset() {
	if (okReset) {
		// reset the ball
		okDrawBall = false;
		setBall();
		// reset AIPaddle
		AISpeed = 3+Math.random()*2;
		ballDest = 175;
		// award points
		if (pointTo == 'AI') points[0]++;
		if (pointTo == 'player') points[1]++;
		okFlashBoard = true;
		okReset = false;
	}
}

function drawPlayerPaddle() {
	// get context
	var c1 = document.getElementById('canvas1').getContext('2d');
	// erase old paddle
	c1.clearRect(628, 0, 10, 360);
	// update paddle position
	paddlePos = mousePos-30;
	// draw new paddle
	c1.fillStyle = 'black';
	c1.fillRect(628, paddlePos, 10, 60);
}

function drawAIPaddle() {
	// get context
	var c1 = document.getElementById('canvas1').getContext('2d');
	// erase old paddle
	c1.clearRect(2, 0, 10, 360);
	// determine AI paddle position
	if (ball.x < 400) {
		if (okGetBallDest) {
			ballDest = getBallDest();
			okGetBallDest = false;
		}
		if (AIPos+25 < ballDest) AIPos += AISpeed;
		if (ballDest < AIPos+25) AIPos -= AISpeed;
	}
	// draw new paddle
	c1.fillStyle = 'black';
	c1.fillRect(2, AIPos, 10, 60);
}

function drawBall() {
	if (okDrawBall) {
		// get context
		var c1 = document.getElementById('canvas1').getContext('2d');
		// erase old ball
		c1.clearRect(ball.x-1, ball.y-1, 12, 12);
		// ubdate ball object
		ball.x += ball.speedX;
		ball.y += ball.speedY;
		if (((paddlePos-10 < ball.y) && (ball.y < paddlePos+60) && (618 < ball.x) && (ball.x < 640)) || 
				((AIPos-10 < ball.y) && (ball.y < AIPos+60) && (-10 < ball.x) && (ball.x < 12))) {
			paddleWhack();
		}
		if (ball.y <= 2) {
			ball.speedY *= -1;
			ball.y = 2;
			tableBounceSound.play();
		}
		if (348 <= ball.y) {
			ball.speedY *= -1;
			ball.y = 348;
			tableBounceSound.play();
		}
		if (640 < ball.x) {
			AIScoreSound.play();
			pointTo = 'AI';
			okReset = true;
		}
		if (ball.x < -10) {
			playerScoreSound.play();
			pointTo = 'player'
			okReset = true;
		}
		// draw new ball
		c1.fillStyle = 'black';
		c1.fillRect(ball.x, ball.y, 10, 10);
	}
}

function getMousePos(evt) {
	// get canvas position
	var obj = cancan;
	var top = 0;
	/*var left = 0;*/
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		/*left += obj.offsetLeft;*/
		obj = obj.offsetParent;
	}
	// return relative mouse position
	/*var mouseX = evt.clientX - left + window.pageXOffset;*/
	var mouseY = evt.clientY - top + window.pageYOffset;
	return mouseY
}

function drawBoard() {
	// get context
	var c0 = document.getElementById('canvas0').getContext('2d');
	// background
	c0.fillStyle = 'white';
	c0.fillRect(0, 0, 640, 360);
	// all lines are the same width
	c0.lineWidth = 2;
	// black sidelines
	c0.beginPath();
	c0.moveTo(0, 1);
	c0.lineTo(640, 1);
	c0.moveTo(0, 359);
	c0.lineTo(640, 359);
	c0.closePath();
	c0.strokeStyle = 'black';
	c0.stroke();
	// red goal lines
	c0.beginPath();
	c0.moveTo(1, 2);
	c0.lineTo(1, 358);
	c0.moveTo(639, 2);
	c0.lineTo(639, 358);
	c0.closePath();
	c0.strokeStyle = hsl(0, 100, 80);
	c0.stroke();
	// center line
	c0.beginPath();
	c0.moveTo(320, 2);
	c0.lineTo(320, 358);
	c0.closePath();
	c0.strokeStyle = hsl(0, 0, 90);
	c0.stroke();
	c0.fillStyle = hsl(0, 0, 90);
	c0.fillRect(313, 173, 14, 14);
	c0.fillStyle = 'white';
	c0.fillRect(315, 175, 10, 10);
	// score
	c0.font = '17pt Verdana';
	c0.fillStyle = 'black';
	c0.fillText(points[0], 280, 30);
	c0.fillText(points[1], 330, 30);
}

function flashBoard() {
	if(okFlashBoard) {
		var c0 = document.getElementById('canvas0').getContext('2d');
		c0.font = '17pt Verdana';
		if (flashCount == 20 || flashCount == 60 || flashCount == 100) {
			c0.beginPath();
			if (pointTo == 'player') {
				c0.moveTo(1, 2);
				c0.lineTo(1, 358);
				c0.fillStyle = 'white';
				c0.fillRect(330, 5, 30, 25);
				c0.fillStyle = hsl(0, 100, 50);
				c0.fillText(points[1], 330, 30);
			} else {
				c0.moveTo(639, 2);
				c0.lineTo(639, 358);
				c0.fillStyle = 'white';
				c0.fillRect(280, 5, 30, 25);
				c0.fillStyle = hsl(0, 100, 50);
				c0.fillText(points[0], 280, 30);
			}
			c0.closePath();
			c0.strokeStyle = hsl(0, 100, 50);
			c0.stroke();
		}
		if (flashCount == 40 || flashCount == 80) {
			c0.beginPath();
			if (pointTo == 'player') {
				c0.moveTo(1, 2);
				c0.lineTo(1, 358);
				c0.fillStyle = 'white';
				c0.fillRect(330, 5, 30, 25);
				c0.fillStyle = 'black';
				c0.fillText(points[1], 330, 30);
			} else {
				c0.moveTo(639, 2);
				c0.lineTo(639, 358);
				c0.fillStyle = 'white';
				c0.fillRect(280, 5, 30, 25);
				c0.fillStyle = 'black';
				c0.fillText(points[0], 280, 30);
			}
			c0.closePath();
			c0.strokeStyle = hsl(0, 100, 80);
			c0.stroke();
		}
		if (flashCount == 0) {
			c0.beginPath();
			if (pointTo == 'player') {
				c0.moveTo(1, 2);
				c0.lineTo(1, 358);
				c0.fillStyle = 'white';
				c0.fillRect(330, 5, 30, 25);
				c0.fillStyle = 'black';
				c0.fillText(points[1], 330, 30);
			} else {
				c0.moveTo(639, 2);
				c0.lineTo(639, 358);
				c0.fillStyle = 'white';
				c0.fillRect(280, 5, 30, 25);
				c0.fillStyle = 'black';
				c0.fillText(points[0], 280, 30);
			}
			c0.closePath();
			c0.strokeStyle = hsl(0, 100, 80);
			c0.stroke();
			// done flashing, start next round
			okFlashBoard = false;
			okDrawBall = true;
			okGetBallDest = true;
			pointTo = '';
			flashCount = 101;
		}
		if (0 < flashCount) flashCount--;
	}
}

function drawPause() {
	var c1 = document.getElementById('canvas1').getContext('2d');
	if (paused) {
		c1.fillStyle = 'hsla(0,0%,20%,0.5)';
		c1.fillRect(0, 0, 640, 360);
		c1.font = '17pt Verdana';
		c1.fillStyle = 'white';
		c1.fillText('click to play/pause', 60, 90);
	} else {
		c1.clearRect(0, 0, 640, 360);
	}
}

function paddleWhack() {
	ball.speedX *= -1;
	// prevent sticking
	if (ball.x < 320) {
		ball.x = 12;
	} else {
		ball.x = 618;
	}
	if (ball.speedX < 0) {
		ball.speedX -= 0.3;
		ball.speedY -= (paddlePos+25-ball.y-5)/10;
		playerPaddleSound.play();
		AISpeed = 3+Math.random()*2;
		okGetBallDest = true;
	} else {
		ball.speedX += 0.3;
		ball.speedY -= (AIPos+25-ball.y-5)/10;
		AIPaddleSound.play();
	}
	if (ball.speedY < 0) {
		ball.speedY -= 0.3;
	} else {
		ball.speedY += 0.3;
	}
	console.log("WHACK");
}

function setBall() {
	ball.x = 315;
	ball.y = 175;
	ball.speedX = (4+Math.random())*getSign();
	ball.speedY = (Math.random()*2)*getSign();
}

function getBallDest() {
	if (ball.speedX < 0) {
		var dupeBall = {x: ball.x, y: ball.y, speedX: ball.speedX, speedY: ball.speedY};
		while (0 < dupeBall.x) {
			dupeBall.x += dupeBall.speedX;
			dupeBall.y += dupeBall.speedY;
			if ((dupeBall.y >= 348) || (dupeBall.y <= 2)) dupeBall.speedY *= -1;
		}
		return dupeBall.y;
	} else {
		return 175;
	}
}

function endGame() {
	var c1 = document.getElementById('canvas1').getContext('2d');
	c1.fillStyle = 'hsla(0,0%,20%,0.5)';
	c1.fillRect(0, 0, 640, 360);
	c1.font = '17pt Verdana';
	c1.fillStyle = 'white';
	if (points[0] < points[1]) {
		// player has 100 points
		c1.fillText('Wow.', 60, 90);
		c1.fillText('You have 100 points!', 60, 120);
		c1.fillText('You are good.', 60, 150);
		c1.fillText('Now go outside.', 60, 180);
	} else {
		// AI has 100 points
		c1.fillText('The computer has 100 points.', 60, 90);
		c1.fillText('You dishonor family.', 60, 120);
	}
}

function getSign() {
	var sign = Math.round(Math.random());
	if (sign == 0) sign--;
	return sign;
}

function hsl(hue, sat, lit) {
	return "hsl(" + hue + ", " + sat + "%, " + lit + "%)";
}

} // init