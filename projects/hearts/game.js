var $ = function(query){
	return document.querySelectorAll(query);
}

var vendorPrefix = (function(){
    var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
    	tran = "Transform";

    var el = document.createElement('div');

    for (var i=0; i<prefixes.length; ++i) {
      var vendorTran = prefixes[i] + tran;
      if (vendorTran in el.style){
      	return prefixes[i]; 
      }
  }
})();

var game = {
	status: 'prepare',
	heartBroken: false,
	currentPlay: 0,
	players: [],
	rounds: -1,
	directions: ['left', 'right', 'opposite'],
	proceed: function(){
		({
			'prepare': function(){
				[].forEach.call($('.movable'), function(c){
					c.classList.remove('movable');
				})
				game.interface.hideMessage();
				game.interface.button.classList.remove('show');
				game.rounds++;
				for(var i = 0; i < 4; i++){
					game.players[i].score = 0;
					game.players[i].row.cards = [];
					game.players[i].waste.cards = [];
				}
				game.board.desk.cards = [];
				game.board.desk.players = [];
				game.board.cards.forEach(function(c){
					c.parent = null;
					c.flip(true);
				});
				game.heartBroken = false;
				game.layout.adjust();
				function move(){
					if(curI === game.board.cards.length){
						game.players.forEach(function(v){v.row.sort();});
						setTimeout(function(){
							game.status = 'start';
							game.proceed();
						}, 300);
						return;
					}
					game.players[curI % 4].row.addCard(game.board.cards[carddeck[curI]]);
					game.players[curI % 4].row.adjustPos();
					if(curI%4 === 0){
						var pc = game.board.cards[carddeck[curI]];
					}
					curI++;
					setTimeout(move, 70);
				}
				curI = 0;
				var carddeck=[];
				for(var i=0;i<52;i++)
				{
					carddeck.push(i);
				}

				for(var i = 0; i < 52; i++){
					var ran=Math.floor(Math.random()*(52-i));
					var tmp = carddeck[ran];
					carddeck[ran]=carddeck[51-i];
					carddeck[51 - i]=tmp;
				}
				for(var i = 0; i < 52; i++){
					var c = game.board.cards[carddeck[i]].display.style;
					c.zIndex = 53 - i;
					c[vendorPrefix + 'Transform'] = 'translate3d(-' + (52-i)/4+'px,-' + (52-i)/4 + 'px, 0) rotateY(180deg)';
				}
				setTimeout(function(){move();}, 300);
			},
			'start': function(){
				game.players.forEach(function(p){
					p.prepareTransfer();
				});
			},
			'passing': function(){
				if(game.currentPlay === 0){
					game.status = 'confirming';
					game.players[0].myTurn();
					game.players.forEach(function(r){
						r.row.sort();
					})
				}else{
					game.players[game.currentPlay].myTurn();
				}
			},
			'confirming': function(){
				game.interface.button.classList.add('show');
				game.players[0].row.curShifted = [];
				game.players[0].row.adjustPos();
				game.currentPlay = game.board.cards[26].parent.playedBy.id;
				setTimeout(function(){
					game.status = 'playing';
					game.proceed();
				}, 100);
			},
			'playing': function(){
				game.interface.button.classList.remove('show');
				if(game.board.desk.cards.length === 4){
					game.board.desk.score();
				}else if(game.players[0].row.curShifted.length === 1){
					game.interface.hideMessage();
					game.players[0].row.out(game.players[0].row.curShifted[0].ind, true);
					game.players[0].next();
				}else{
					game.players[game.currentPlay].myTurn();
				}
			},
			'allEnd': function(){
				game.interface.playerBoards.forEach(function(p){
					p.display.style[vendorPrefix + 'Transform'] = "";
				});
				game.interface.endMessage.classList.remove('show');
				game.players.forEach(function(p){
					p.score = p.oldScore = 0;
				});
				game.rounds = -1;
				game.interface.playerBoards.forEach(function(p){
					p.hideFinal();
					p.display.classList.remove('table');
				});
				game.newGame();
			},
			'end': function(){
				game.interface.playerBoards.forEach(function(p){
					p.hideFinal();
					p.display.classList.remove('table');
				});
				game.newRound();
			}
		})[this.status]();
	},
	interface: {
		arrow: document.createElement('div'),
		button: document.createElement('button'),
		message: document.createElement('div'),
		showMessage: function(msg){
			this.message.innerHTML = msg;
			this.message.style.display = 'block';
		},
		hideMessage: function(){ 
			this.message.style.display = '';
		},
		playerBoards: [],
		endMessage: document.createElement('div')
	},
	board: {
		cards: [],
		desk: {
			cards: [],
			players: [],
			getPosFor: function(ind){
				var pos = {
					x: 0,
					y: game.layout.cardHeight / 2 + game.layout.cardWidth / 2,
					z: ind + 52
				};
				pos.rotation = this.cards[ind].pos.rotation;
				return pos;
			},
			addCard: function(card, applying){
				card.ind = this.cards.length;
				this.cards.push(card);
				if(!applying){
					this.players.push(card.parent.playedBy);
				}
				card.parent = this;
				card.flip(false);
			},
			adjustPos: function(){
				this.cards.forEach(function(c){
					c.adjustPos();
				});
			},
			score: function(){
				var max = 0;
				for(var i = 1; i < 4; i++){
					if( this.cards[i].suit === this.cards[max].suit && (this.cards[i].num > this.cards[max].num)){
						max = i;
					}
				}
				var p = this.players[max],
					self = this;
				setTimeout(function(){
					game.currentPlay = p.id;
					p.waste.addCards(self.cards);
					self.players = [];
					self.cards = [];
					if(game.players[0].row.cards.length === 0){
						setTimeout(function(){
							game.end();
						},600);
					}else{
						setTimeout(function(){
							game.proceed();
						},600);
					}
				}, 800);
			}
		}
	},
	players: [],
	layout: {
		width: 500,
		height: 500,
		cardSep: 30,
		cardHeight: 130,
		cardWidth: 85,
		rowMargin: 10,
		boardHeight: 55,
		boardWidth: 250,
		adjust: function(){
			var region = $('#game-region')[0];
			this.width = region.offsetWidth;
			this.height = region.offsetHeight;
			game.players.forEach(function(r){
				r.row.adjustPos();
				r.waste.adjustPos();
			});
			game.board.desk.adjustPos();
		}
	},
	createObjects: function(){
		var frag = document.createDocumentFragment();
		for(var i=0;i<52;i++){
			var c = new Card(i);
			game.board.cards.push(c);
			frag.appendChild(c.display);
		}
		for(var i=0;i<4;i++){
			var b = new PlayerBoard(i);
			game.interface.playerBoards.push(b);
			frag.appendChild(b.display);
		}
		game.interface.playerBoards[0].display.classList.add('human');
		game.players = [
			new Human(0),
			new Ai(1),
			new Ai(2),
			new Ai(3)
		];
		for(var i = 0; i < 4; i++){
			game.players[i].name = game.storage.names[i];
		}
		game.interface.arrow.innerHTML = "&larr;";
		game.interface.arrow.id = 'pass-arrow';
		game.interface.arrow.onmouseup = function(){
			game.interface.hideMessage();
			game.status = 'passing';
			game.currentPlay = 0;
			game.players[0].transfer(game.players[0].row.curShifted);
			this.classList.remove('show');
		}

		game.interface.button.id = 'play-button';
		game.interface.button.onmouseup = function(){
			game.proceed();
			this.classList.remove('show');
		}

		game.interface.message.id = 'game-message';

		game.interface.endMessage.id = 'end-message';

		frag.appendChild(game.interface.arrow);
		frag.appendChild(game.interface.button);
		frag.appendChild(game.interface.message);
		frag.appendChild(game.interface.endMessage);

		$('#game-region')[0].appendChild(frag);
	},
	end: function(){
		if(game.players[0].score === 26){
			game.totalSTM += 1;
		}
		if(this.players.some(function(p){
			return p.score === 26;
		})){
			this.players.forEach(function(p){
				if(p.score !== 26){
					p.score = 26;
				}else{
					p.score = 0;
				}
			});
		}
		this.players.forEach(function(p){
			p.oldScore += p.score;
		});
		game.storage.totalScore += game.players[0].score;
		game.storage.roundsPlayed += 1;
		this.status = 'end';
		var rank = this.players.map(function(c){
			return c;
		});
		rank.sort(function(a,b){
			return a.oldScore - b.oldScore;
		});
		rank.forEach(function(r,ind){
			r.board.rank = ind;
		});
		this.layout.adjust();
		var self = this;
		setTimeout(function(){
			self.interface.playerBoards.forEach(function(p){
				p.showFinal();
			});
			if(game.players.some(function(p){
				return p.oldScore > 100;
			})){
				if(game.players[0].board.rank === 0){
					game.interface.endMessage.innerHTML = 'You Won!'
					game.interface.endMessage.style.color = 'white';
					game.interface.endMessage.classList.add('show');
					game.storage.totalVictory += 1;
				}else{
					game.interface.endMessage.innerHTML = 'You Lost!'
					game.interface.endMessage.style.color = 'grey';
					game.interface.endMessage.classList.add('show');
				}
				game.status = 'allEnd';
				game.storage.timesPlay += 1;
				game.interface.playerBoards.forEach(function(p){
					p.display.style[vendorPrefix + 'Transform'] = 
					'translate3d(0, -' + ((game.layout.boardHeight + 10) * 2 + 40) + 'px, 0)';
				});
			}
			game.interface.button.innerHTML = 'Continue';
			game.interface.button.classList.add('show');
		}, 600)
	},
	newRound: function(){
		game.status = 'prepare';
		game.proceed();
	},
	newGame: function(){
		game.players.forEach(function(p){
			p.oldScore = 0;
		})
		game.rounds = 0;
		game.status = 'prepare';
		game.proceed();
	},
	load: function(){
		game.state.apply();
		game.players.forEach(function(p){
			p.score = p.waste.cards.reduce(function(p, c){
				if(c.suit === 1){
					return p + 1;
				}else if(c.suit === 0 && c.num === 11){
					return p + 13;
				}else{
					return p;
				}
			}, 0);
		});
		game.layout.adjust();
		game.proceed();
	}
}

window.onresize = function(){
	game.layout.adjust();
}

var suits = ['spade', 'heart', 'club', 'diamond'];

var Card = function(id){
	this.id = id;
	this.num = id % 13 + 1;
	this.suit = id % 4;
	this.flipped = true;
	this.rotateY = 180;

	this.display = document.createElement('div');
	this.display.className = 'card flipped';
	this.display.style[vendorPrefix + 'Transform'] = 'rotateY(180deg)'

	var acutualNum = this.num + 1;
	var numtext = acutualNum + '';
 	if(acutualNum > 10){
 		numtext = ({
 			11: 'J',
 			12: 'Q',
 			13: 'K',
 			14: 'A'
 		})[acutualNum];
 	}
	
 	var numText = document.createElement('div');
 	numText.className = 'num';
 	numText.innerHTML = numtext;

	this.front = document.createElement('div');
	this.front.className = 'front';
	this.front.appendChild(numText);
	this.display.classList.add(suits[this.suit]);

	var icon = document.createElement('div');
	icon.className = 'icon';
	this.front.appendChild(icon);

 	this.display.appendChild(this.front);

 	this.back = document.createElement('div');
 	this.back.className = 'back';

 	this.display.appendChild(this.back);
 }

Card.prototype.flip = function(flipped){
	if(flipped != this.flipped){
		this.flipped = flipped;
		if(flipped){
			this.display.classList.add('flipped');
			this.rotateY = 180;
		}else{
			this.display.classList.remove('flipped');
			this.rotateY = 0;
		}
	}
}

Card.prototype.adjustPos = function(time){
	this.pos = this.parent.getPosFor(this.ind);
	this.adjustDisplay();
}

Card.prototype.adjustDisplay = function(){
	this.display.style.zIndex = this.pos.z;
	this.display.style[vendorPrefix + 'Transform'] = 
		'rotate(' + this.pos.rotation + 'deg) translate3d(' +
			this.pos.x + 'px,' + this.pos.y + 'px,0) ' + 
			'rotateY(' + this.rotateY +'deg)';
}

Card.prototype.shift = function(par){
	return function(){
		if(par.parent.curShifted.indexOf(par) !== -1){
			par.parent.removeShift(par);
		}else{
			par.parent.addShift(par);
		}
	}
}

Card.prototype.out = function(){
	this.display.style[vendorPrefix + 'Transform'] = 
		'rotate(' + this.pos.rotation + ')';
}

var Row = function(id){
	this.id = id;
	this.cards = [];
	this.isVertical = id%2;
	this.rotation = 90 * (( id + 1) % 4) - 90;
	this.curShifted = [];
	this.flipped = true;
}

Row.prototype.addCard = function(card){
	card.parent = this;
	card.ind = this.cards.length;
	this.cards.push(card);
	card.flip(this.flipped);
	if(!this.flipped){
		card.display.onmouseup = card.shift(card);
	}
}

Row.prototype.adjustPos = function(){
	if(this.isVertical){
		this.distance = game.layout.width / 2 - game.layout.rowMargin - game.layout.cardHeight / 2;
		this.playedBy.board.display.style.top = game.layout.height / 2 - game.layout.boardHeight / 2 + 'px';
		if(this.id === 1){
			this.playedBy.board.display.style.left = game.layout.rowMargin * 1.5 + 'px';
		}else{
			this.playedBy.board.display.style.left = game.layout.width - game.layout.rowMargin * 1.5 - game.layout.boardWidth + 'px';
		}
	}else{
		this.distance = game.layout.height / 2 - game.layout.rowMargin - game.layout.cardHeight / 2;
		this.playedBy.board.display.style.left = game.layout.width / 2 - game.layout.boardWidth / 2 + 'px';
		if(this.id === 0){
			this.playedBy.board.display.style.top = game.layout.height - 30 - game.layout.rowMargin * 1.5 - game.layout.boardHeight - game.layout.cardHeight + 'px';
		}else{
			this.playedBy.board.display.style.top = 30 + game.layout.rowMargin * 1.5 + 'px';
		}
	}
	this.left = -((this.cards.length - 1) * game.layout.cardSep) / 2;
	this.playedBy.board.display.classList.remove('table');
	if(game.status === 'end'){
		var top = game.layout.height / 2 - 2 * (game.layout.boardHeight + 10),
			left = game.layout.width / 2 - game.layout.boardWidth / 2;
		var b = this.playedBy.board;
		b.display.style.top = top + b.rank * (game.layout.boardHeight + 10) + 'px';
		b.display.style.left = left + 'px';
		b.display.classList.add('table');
	}
	this.cards.forEach(function(c){
		c.adjustPos();
	})
}

Row.prototype.getPosFor = function(ind){
	var pos = {
		x: this.left + ind * game.layout.cardSep,
		y: this.distance,
		rotation: this.rotation,
		z: ind
	};
	if(this.curShifted.indexOf(this.cards[ind]) > -1){
		pos.y -= 30;
	}
	return pos;
}

Row.prototype.sort = function(){
	this.cards.sort(function(a, b){
		if(a.suit != b.suit) return b.suit - a.suit;
		return a.num - b.num;
	}).forEach(function(v, ind){
		v.ind = ind;
	})
	this.cards.forEach(function(v){
		v.adjustPos();
	})
}

Row.prototype.addShift = function(nc){
	if(!nc.display.classList.contains('movable'))return;
	({
		'start': function(){
			if(this.curShifted.length === 3){
				this.curShifted.shift();
			}
			this.curShifted.push(nc);
			if(this.curShifted.length === 3){
				game.interface.arrow.classList.add('show');
			}
		},
		'playing': function(){
			this.curShifted.pop();
			this.curShifted.push(nc);
			this.showButton();
		},
		'confirming': function(){}
	})[game.status].call(this);
	this.adjustPos();
}

Row.prototype.showButton = function(){
	game.interface.button.innerHTML = 'Go!';
	game.interface.button.classList.add('show');
}


Row.prototype.out = function(ind, toDesk){
	this.curShifted = [];
	var c = this.cards[ind];
	if(c.suit === 1 && toDesk){
		game.heartBroken = true;
	}
	c.display.onmouseup = null;
	this.cards.splice(ind, 1);
	for(var i = ind; i < this.cards.length; i++){
		this.cards[i].ind = i;
	}
	if(toDesk){
		game.board.desk.addCard(c);
		c.adjustPos();
		this.adjustPos();
	}
}

Row.prototype.removeShift = function(nc){
	if(game.status === 'confirming') return;
	game.interface.arrow.classList.remove('show');
	game.interface.button.classList.remove('show');
	this.curShifted = this.curShifted.filter(function(v){
		return v !== nc;
	});
	this.adjustPos();
}

Row.prototype.hideOut = function(ind){
	var tmp = this.cards[ind];
	var mid = Math.floor(this.cards.length / 2);
	this.cards[ind] = this.cards[mid];
	this.cards[mid] = tmp;
	this.cards[ind].ind = ind;
	this.cards[mid].ind = mid;
	this.cards[ind].display.style[vendorPrefix + 'Transition'] = 'none';
	this.cards[mid].display.style[vendorPrefix + 'Transition'] = 'none';
	this.cards[mid].adjustPos();
	this.cards[ind].adjustPos();
	this.cards[ind].display.style[vendorPrefix + 'Transition'] = '';
	this.cards[mid].display.style[vendorPrefix + 'Transition'] = '';
	var self = this;
	setTimeout(function(){
		self.out(mid, true);
	}, 100);
}

var Waste = function(id){
	this.id = id;
	this.isVertical = id % 2;
	this.rotation = 90 * ((id + 1) % 4) -90;
	this.cards = [];
}

Waste.prototype.adjustPos = function(){
	if(this.isVertical){
		this.distance = game.layout.width / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
	}else{
		this.distance = game.layout.height / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
	}
	this.cards.forEach(function(c){
		c.adjustPos();
	})
}

Waste.prototype.getPosFor = function(ind){
	var pos = {
		x: 0,
		y: this.distance,
		rotation: this.rotation,
		z: ind + 52
	};
	return pos;
}

Waste.prototype.addCards = function(cards){
	this.playedBy.score += cards.reduce(function(p, c){
		if(c.suit === 1){
			return p + 1;
		}else if(c.suit === 0 && c.num === 11){
			return p + 13;
		}else{
			return p;
		}
	}, 0);
	for(var i = 0; i < cards.length; i++){
		if(cards[i].pos.rotation === this.rotation){
			cards[i].pos.z = 104;
			var finalCard = cards[i];
		}else{
			cards[i].pos.rotation = this.rotation;
			this.addCard(cards[i]);
		}
		cards[i].adjustDisplay();
	}
	this.addCard(finalCard);
	var self = this;
	setTimeout(function(){
		self.adjustPos();
	},300);
}

Waste.prototype.addCard = function(card){
	card.parent = this;
	this.cards.push(card);
}

var player = function(id){
	this.row = new Row(id)
	this.row.playedBy = this;
	this.waste = new Waste(id);
	this.board = game.interface.playerBoards[id];
	this.waste.playedBy = this;
	this.id = id;
	this._score = 0;
	this._name = '';
	this._oldScore = 0;
	Object.defineProperty(this, 'score', {
		get: function(){
			return this._score;
		},
		set: function(v){
			if(v > this._score){
				var b = this.board.scoretext.classList;
				b.add('highlight');
				setTimeout(function(){
					b.remove('highlight');
				},100);
			}
			this._score = v;
			if(game.rounds > 0){
				this.board.scoretext.innerHTML = this._oldScore + '+' + v;
			}else{
				this.board.scoretext.innerHTML = v;
			}
		}
	});
	Object.defineProperty(this, 'name', {
		get: function(){
			return this._name;
		},
		set: function(v){
			this._name = v;
			this.board.nametext.innerHTML = v;
		}
	});
	Object.defineProperty(this, 'oldScore', {
		get: function(){
			return this._oldScore;
		},
		set: function(v){
			this._oldScore = v;
			this.board.finaltext.innerHTML = v;
		}
	});
}

player.prototype.next = function(delay){
	game.currentPlay = (this.id + 1) % 4;
	if(delay){
		setTimeout(function(){
			game.proceed();
		},delay);
	}else{
		game.proceed();
	}
}

player.prototype.watch = function(){};

player.prototype.myTurn = function(){};

player.prototype.out = function(outCards){
	var self = this;
	outCards.forEach(function(c){
		self.row.out(self.row.cards.indexOf(c));
	});
}

player.prototype.takeIn = function(inCards){
	var self = this;
	inCards.forEach(function(c){
		self.row.addCard(c);
	});
}

player.prototype.getValidCards = function(){
	if(game.board.desk.cards.length === 0){
		if(game.heartBroken){
			return this.row.cards;
		}else if(this.row.cards.length === 13){
			return [game.board.cards[26]];
		}else{
			var cards = this.row.cards.filter(function(c){
				return c.suit !== 1;
			});
			if(cards.length === 0){
				return this.row.cards;
			}else{
				return cards;
			}
		}
	}else{
		var cards = this.row.cards.filter(function(c){
			return c.suit === game.board.desk.cards[0].suit;
		});
		if(cards.length === 0){
			return this.row.cards;
		}else{
			return cards;
		}
	}
}

player.prototype.transfer = function(cards){
	this.out(cards);
	var adds = [1, 3, 2];
	game.players[(this.id + adds[game.rounds % 3]) % 4].takeIn(cards);
	this.next();
}

var Human = function(id){
	player.call(this, id);
	this.row.flipped = false;
}

Human.prototype.__proto__ = player.prototype;

Human.prototype.takeIn = function(cards){
	player.prototype.takeIn.call(this,cards);
	this.row.curShifted = cards;
}

Human.prototype.next = function(){
	this.row.cards.forEach(function(c){
		[].forEach.call($('.movable'), function(e){
			e.classList.remove('movable');
		});
	});
	player.prototype.next.call(this);
}

Human.prototype.myTurn = function(){
	if(game.status === 'start'){
		game.status = 'passing';
		game.proceed();
	}else if(game.status === 'confirming'){
		game.interface.button.innerHTML = 'Confirm';
		game.interface.button.classList.add('show');
	}else{
		var cs = this.getValidCards();
		cs.forEach(function(c){
			c.display.classList.add('movable');
		});
		if(cs[0].id === 26){
			game.interface.showMessage('Please start with 2 of Clubs.');
		}
	}
}

Human.prototype.prepareTransfer = function(){
	game.interface.showMessage("Pass three cards to the " + game.directions[game.rounds % 3]);
	[function(){
		game.interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(0)';
	},function(){
		game.interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(180deg)';
	},function(){
		game.interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(90deg)';
	}][game.rounds % 3]();
	this.row.cards.forEach(function(c){
		c.display.classList.add('movable');
	});
}

var Ai = function(id){
	player.call(this, id);
}

Ai.prototype.__proto__ = player.prototype;

Ai.prototype.prepareTransfer = function(){
	var select = [], cards = [];
	while(select.length < 3){
		var s = Math.floor(Math.random() * this.row.cards.length);
		if(select.indexOf(s) === -1){
			select.push(s);
		}
	}
	for(var i = 0; i < 3; i++){
		cards.push(this.row.cards[select[i]]);
	}
	this.myTurn = function(){
		this.transfer(cards);
		delete this.myTurn;
	}
}

Ai.prototype.myTurn = function(){
	var vc = this.getValidCards(),
		len = vc.length;
	this.row.hideOut(vc[Math.floor(Math.random() * len)].ind);	
	this.next(500);
}

var PlayerBoard = function(id){
	this.id = id;
	this.display = document.createElement('div');
	this.display.className = 'info-board';
	this.nametext = document.createElement('div');
	this.nametext.className = 'player-name';
	this.scoretext = document.createElement('div');
	this.scoretext.className = 'player-score';
	this.scoretext.innerHTML = 0;
	this.finaltext = document.createElement('div');
	this.finaltext.className = 'final-score';
	this.finaltext.innerHTML = 0;

	this.display.appendChild(this.nametext);
	this.display.appendChild(this.scoretext);
	this.display.appendChild(this.finaltext);
}

PlayerBoard.prototype.showFinal = function(){
	this.display.style.marginLeft = '-55px';
	this.finaltext.classList.add('show');
}

PlayerBoard.prototype.hideFinal = function(){
	this.display.style.marginLeft = '';
	this.finaltext.classList.remove('show');
}