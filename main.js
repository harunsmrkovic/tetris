/*

	Assignment: Tetris
	Date: 02.12.2014.
	Author: Harun Smrkovic (hakazvaka@gmail.com)

*/

'use strict';
(function(){

	var tetris = {};
	// bind to window
	window.Tetris = tetris;

	/*
		game defaults
	*/

	tetris.board = [];
	tetris.boardWidth = 20;
	tetris.boardHeight = 20;

	tetris.character = '*';

	tetris.pieces = [];

	tetris.points;
	// pieces
	/*
		****
	*/
	tetris.pieces[0] = [[1, 1, 1, 1]];
	/*
		*
		*
		**
	*/
	tetris.pieces[1] = [[1, 0], [1, 0], [1, 1]];
	/*
		 *
		 *
		**
	*/
	tetris.pieces[2] = [[0, 1], [0, 1], [1, 1]];
	/*
		 *
		**
		*
	*/
	tetris.pieces[3] = [[0, 1], [1, 1], [1, 0]];
	/*
		**
		**
	*/
	tetris.pieces[4] = [[1, 1], [1, 1]];

	/*
		game logic start 
	*/

	// this will just generate an empty board
	tetris.generateEmptyBoard = function(){
		for(var x = 0; x < tetris.boardHeight; x++){
			tetris.board[x] = [];
			for(var y = 0; y < tetris.boardWidth; y++){
				tetris.board[x][y] = (y == 0 || y == tetris.boardHeight-1 || x == tetris.boardWidth-1) ? 1 : 0;
			}
		}
	};

	// this function is the same as rendering function, just that it returns FALSE for when it tries to replace 1 with 1...
	tetris.simulateMove = function(piece, startX, startY){
		var pi = 0;
		for(var cy = startY; cy <= startY + piece.length - 1; cy++){
			var pj = 0;
			for(var cx = startX; cx <= startX + piece[pi].length - 1; cx++){
				if(typeof tetris.board[cy][cx] === 'undefined') return false;
				
				if(tetris.board[cy][cx] !== 0 && piece[pi][pj] === 1){
					return false;
				}
				pj++;
			}
			pi++;
		}
		return true;
	};

	// this function renders piece on the board (changes zero-es with 1)
	tetris.renderPiece = function(piece, startX, startY, kill){
		var pi = 0;
		for(var cy = startY; cy <= startY + piece.length - 1; cy++){
			var pj = 0;
			for(var cx = startX; cx <= startX + piece[pi].length - 1; cx++){
				if(piece[pi][pj] === 1){
					tetris.board[cy][cx] = (kill) ? 0 : piece[pi][pj];
				}
				pj++;
			}
			pi++;
		}
	};

	// this generates a new piece at the top of the board
	tetris.throwNewPiece = function(tries){
		if(typeof tries === 'undefined') tries = 1;
		tetris.currentPiece = {
			piece: 0,
			x: randomInt(1, tetris.boardWidth - 3),
			y: 0
		};

		// try to append it
		if(tetris.simulateMove(tetris.pieces[tetris.currentPiece.piece], tetris.currentPiece.x, tetris.currentPiece.y)){
			tetris.renderPiece(tetris.pieces[tetris.currentPiece.piece], tetris.currentPiece.x, tetris.currentPiece.y);
		}
		else {
			// if it cannot be rendered, try for maximum of 20 random times... this can be much improved though
			if(tries < 20){
				tetris.throwNewPiece(tries+1);
			}
			else {
				alert('GAME OVER');
			}
		}
	};

	// main function which moves pieces left/right/clockwise/counter-clockwise and pushes them down
	tetris.movePiece = function(direction){
		// remove the piece from current position, so it can be drawn on next
		tetris.renderPiece(tetris.pieces[tetris.currentPiece.piece], tetris.currentPiece.x, tetris.currentPiece.y, true);

		// move it down for sure
		var nextY = tetris.currentPiece.y + 1;
		var executeMove = false;
		
		// if it cannot go either down nor left and right
		// this is a strange implementation, caused by inability to move the tile DOWN; it would not be needed in the real tetris game
		if(!tetris.simulateMove(tetris.pieces[tetris.currentPiece.piece], tetris.currentPiece.x, tetris.currentPiece.y + 1)) {
			// no more possible moves, throw new piece and render the last one again (it was deleted in the beginning)
			tetris.renderPiece(tetris.pieces[tetris.currentPiece.piece], tetris.currentPiece.x, tetris.currentPiece.y);
			tetris.throwNewPiece();
			tetris.render();
		}
		else {
			switch(direction){
				case 'left':
					var nextX = tetris.currentPiece.x - 1;
					if(tetris.simulateMove(tetris.pieces[tetris.currentPiece.piece], nextX, nextY)){
						--tetris.currentPiece.x;
						executeMove = true;
					}
					break;

				case 'right':
					var nextX = tetris.currentPiece.x + 1;
					if(tetris.simulateMove(tetris.pieces[tetris.currentPiece.piece], nextX, nextY)){
						++tetris.currentPiece.x;
						executeMove = true;
					}
					break;

				case 'down':
					var nextX = tetris.currentPiece.x;
					if(tetris.simulateMove(tetris.pieces[tetris.currentPiece.piece], nextX, nextY)){
						executeMove = true;
					}
					break;

				case 'clockwise':
					var nextX = tetris.currentPiece.x;
					var newMatrix = transpose(tetris.pieces[tetris.currentPiece.piece]);
					for(var i = 0; i < newMatrix.length; i++){
						newMatrix[i] = newMatrix[i].reverse();
					}
					if(tetris.simulateMove(newMatrix, tetris.currentPiece.x, tetris.currentPiece.y)){
						tetris.pieces[tetris.currentPiece.piece] = newMatrix;
						executeMove = true;
					}
					break;

				case 'counterClockwise':
					var nextX = tetris.currentPiece.x;
					var newMatrix = transpose(tetris.pieces[tetris.currentPiece.piece]).reverse();
					if(tetris.simulateMove(newMatrix, tetris.currentPiece.x, tetris.currentPiece.y)){
						tetris.pieces[tetris.currentPiece.piece] = newMatrix;
						executeMove = true;
					}
					break;
			}

			// move execution
			if(executeMove){
				tetris.renderPiece(tetris.pieces[tetris.currentPiece.piece], nextX, nextY);
				tetris.render();
				++tetris.currentPiece.y;
			}

			// check for clearance
			for(var r = 0; r < tetris.board.length; r++){
				var row = tetris.board[r];
				var destroy = true;
				for(var c = 0; c < row.length; c++){
					var column = row[c];
					if (column == 0) { destroy = false; break; }	
				}
				if (destroy && r < 19) {
					//tetris.board.splice(r, 1);
					for(i = 0; i < 20; i++) tetris.board[r][i] = (i == 0 || i == 19) ? 1 : 0;
					
					for(i = 18; i > 1; i--) {
						for(j = 1; j < 19; j++) {
							tetris.board[i][j] = tetris.board[i-1][j];
						}
					}

				}
			}
		}
		
	};

	// takes a board and renders it to html or console or wherever
	tetris.render = function(){
		var output = '';
		for(var r = 0; r < tetris.board.length; r++){
			var row = tetris.board[r];
			for(var c = 0; c < row.length; c++){
				var column = row[c];
				var klasa = (c == 0 || c == (tetris.board.length-1) || r == (tetris.board.length)-1) ? "topfill" : "fill";
				output += (column) ? '<div class="kocka '+klasa+'" title="'+c+', '+r+'"></div>' : '<div class="kocka"></div>';
			}
			output += '<div class="clearfix"></div>';
		}
		// final output
		document.getElementById('main').innerHTML = output;
	};

	// methods required to get you started
	tetris.start = function(){
		tetris.generateEmptyBoard();
		tetris.throwNewPiece();
		tetris.render();
		setInterval(function(){
			tetris.movePiece('down');
		}, 500);

	}
	tetris.startOnClick = function(){
		document.getElementById('start').remove();
		tetris.generateEmptyBoard();
		tetris.throwNewPiece();
		tetris.render();
		startListening();
		setInterval(function(){
			tetris.movePiece('down');
		}, 500);
		
	}

	/*
		game logic end
	*/

})();

// default bootstrap
Tetris.start();


// event listeners
function startListening() {
	document.addEventListener('keypress', function(e){
		switch(e.keyCode){
			// A (move left)
			case 97:
				Tetris.movePiece('left');
				break;
			// D (move right)
			case 100:
				Tetris.movePiece('right');
				break;
			// S (rotate clockwise)
			case 115:
				Tetris.movePiece('clockwise');
				break;
			// W (rotate counter-clockwise)
			case 119:
				Tetris.movePiece('counterClockwise');
				break;
		}
});
}