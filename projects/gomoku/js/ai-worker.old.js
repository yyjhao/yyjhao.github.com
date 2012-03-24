self.addEventListener('message', function(e){
	switch(e.data.type){
		case 'ini':
			ai.ini(e.data.moves,e.data.mode,e.data.color);
			break;
		case 'watch':
			ai.watch(e.data.r,e.data.c,e.data.color);
			break;
		case 'compute':
			ai.move();
			break;
		case 'show_me':
			postMessage(ai);
			break;
	}
});

ai={};
ai.sum=0;
ai.setNum=0;
ai.scoreMap=[];
ai.scorequeue=[];
for(var i=0;i<15;i++){
	var tmp=[];
	for(var j=0;j<15;j++){
		var a={
			score: 0,
			r: i,
			c: j
		};
		tmp.push(a);
		ai.scorequeue.push(a);
	}
	ai.scoreMap.push(tmp);
}
ai.map=[];
for (var i=0;i<2;i++){
	var tmp=[];
	for(var j=0;j<4;j++){
		var tmpp=[];
		for(var k=0;k<15;k++){
			var tmpr=[];
			for(var l=0;l<15;l++){
				tmpr.push({
					len:1,
					blockages:0
					});
			}
			tmpp.push(tmpr);
		}
		tmp.push(tmpp);
	}
	ai.map.push(tmp);
}
ai.boardarray=[];
for(var i=0;i<225;i++){
	ai.boardarray.push('');
}

ai.ini=function(moves,mode,color){
	this.color=color;
	if(this.color=='black'){
		this._add=1;
	}else{
		this._add=0;
	}
	this.moves=moves;
	switch(mode){
		case 'novice':
		this.depth=1;
		this.totry=[100,100];
		break;
		case 'medium':
		this.depth=3;
		this.totry=[7,10];
		break;
		case 'expert':
		this.depth=5;
		this.totry=[5,7];
		break;
		default:
		postMessage({type: 'ini_error', reason: mode+' not supported'});
	}
	postMessage({type: 'ini_complete'});
}


ai.sortMove=function(a,b){
	if(a.score==-1/0)return 1;
	if(b.score==-1/0)return -1;
	var x=Math.abs(a.score),y=Math.abs(b.score);
	if(x>y){
		return -1;
	}else{
		return 1;
	}
}

ai.watch=function(r,c,color){
	var changed=this.updateMap(r,c,color);
	if(color=='remove')this.setNum--;
	else this.setNum++;
	for(var i=0;i<changed.length;i++){
		var tmp=this.scoreMap[changed[i][0]][changed[i][1]];
		if(tmp.score!=-1/0){
			this.sum-=tmp.score;
		}
		tmp.score=this.computeScore(changed[i][0],changed[i][1]);
		if(tmp.score!=-1/0){
			this.sum+=tmp.score;
		}
	}
	this.scorequeue.sort(this.sortMove);
	postMessage({type: 'watch_complete'});
}


ai.computeScore=function(x,y){
	if(this.color=='white')var me=1;
	else var me=0;
	var oppo=1-me;
	function sum(prev,elm){
		return prev+elm[x][y].len;
	}
	function blocksum(prev,elm){
		return prev+Math.pow(elm[x][y].len-1,4)*(2-elm[x][y].blockages);
	}
	//set
	if(this.map[me].some(function(elm){
		return elm[x][y].len<=0;
	}))return -1/0;
	//me 5
	if(this.map[me].some(function(elm){
		return elm[x][y].len>4;
	}))return 1000000000000;
	//oppo 5
	if(this.map[oppo].some(function(elm){
		return elm[x][y].len>4;
	}))return -1000000000;
	
	//me 4 not blocked
	var count=this.map[me].reduce(function(prev,elm){
		if(elm[x][y].len==4&&elm[x][y].blockages==0){
			return prev+1;
		}else return prev;
	},0);
	if(count>0)return 100000000+10*count;
	//me 4 blocked >1
	count=this.map[me].reduce(function(prev,elm){
		if(elm[x][y].len==4&&elm[x][y].blockages==1){
			return prev+1;
		}else return prev;
	},0);
	var meFour=false,oppoFour=false;
	if(count>1)return 7000000+10*count;
	else if(count==1)meFour=true;
	//oppo 4 not blocked
	count=this.map[oppo].reduce(function(prev,elm){
		if(elm[x][y].len==4&&elm[x][y].blockages==0){
			return prev+1;
		}else return prev;
	},0);
	if(count>0)return -(4000000+10*count);
	//oppo 4 blocked >1
	count=this.map[oppo].reduce(function(prev,elm){
		if(elm[x][y].len==4&&elm[x][y].blockages==1){
			return prev+1;
		}else return prev;
	},0);
	if(count>1)return -(1000000+10*count);
	else if(count==1)oppoFour=true;
	//me 4 blocked + 3 not blocked
	var meTcount=this.map[me].reduce(function(prev,elm){
		if(elm[x][y].len==3&&elm[x][y].blockages==0){
			return prev+1;
		}else return prev;
	},0);
	if(meTcount>1&&meFour)return 800000+10*count;
	//oppo 4 blocked + 3 not blocked
	var oppoTcount=this.map[oppo].reduce(function(prev,elm){
		if(elm[x][y].len==3&&elm[x][y].blockages==0){
			return prev+1;
		}else return prev;
	},0);
	if(oppoTcount>1&&oppoFour)return -(60000+10*count);
	//me 3 not blocked > 1
	if(meTcount>1)return 400000+meTcount*10+this.map[me].reduce(sum,0);
	//oppo 3 not blocked > 1
	if(oppoTcount>1)return -(300000+oppoTcount*10+this.map[oppo].reduce(sum,0));
	//me 4 blocked
	if(meFour)return 100000+this.map[me].reduce(sum,0);
	//oppo 4 blocked
	if(oppoFour)return -(50000+this.map[oppo].reduce(sum,0));
	//me 3 not blocked
	if(meTcount==1)return 30000+this.map[me].reduce(sum,0);
	//oppo 3 not blocked
	if(oppoTcount==1)return -(20000+this.map[oppo].reduce(sum,0));
	//sum
	return (this.map[me].reduce(blocksum,0)*3-this.map[oppo].reduce(blocksum,0)*2)*(15-Math.abs(x-7)-Math.abs(y-7));
};

ai.updateMap=function(r,c,color){
	var remove=false;
	if(color=='black'){
		var num=0;
	}else if(color=='white'){
		var num=1;
	}else{
		remove=true;
	}
	return this._updateMap(r,c,num,remove);
},
ai._updateMap=function(r,c,num,remove){
	var changed=[[r,c]];
	if(remove){
		this.boardarray[r*15+c]='';
		for(var num=0;num<2;num++){
			for(var i=0;i<4;i++){
				this.map[num][i][r][c].len=1;
				this.map[num][i][r][c].blockages=0;
				for(var coe=-1;coe<2;coe+=2){
					var x=r, y=c,len=0;
					do{
						x+=this.moves[i][0]*coe;
						y+=this.moves[i][1]*coe;
						len++;
					}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y].len==-num)
					if(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y].len>0){
						this.map[num][i][x][y].len=len;
						this.map[num][i][r][c].len+=len-1;
						this.map[num][i][x][y].blockages=0;
						var cont=0,	mx=x+this.moves[i][0]*coe, my=y+this.moves[i][1]*coe;
						while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][i][mx][my].len==-num){
							cont++;
							mx+=this.moves[i][0]*coe;
							my+=this.moves[i][1]*coe;
						}
						this.map[num][i][x][y].len+=cont;
						if(mx<0||my<0||mx>=15||my>=15||this.map[num][i][mx][my].len==num-1)
							this.map[num][i][x][y].blockages++;
						if(changed.indexOf([x,y])==-1)changed.push([x,y]);
					}else{
						this.map[num][i][r][c].len+=len-1;
						this.map[num][i][r][c].blockages++;
					}
				}
			}
		}
	}else{
		this.boardarray[r*15+c]=num;
		for(var i=0;i<4;i++)for(var coe=-1;coe<2;coe+=2){
			//compute for the current color
			var x=r, y=c;
			do{
				x+=this.moves[i][0]*coe;
				y+=this.moves[i][1]*coe;
			}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y].len==-num)
			if(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y].len>0){
				this.map[num][i][x][y].len=this.map[num][i][r][c].len+1;
				this.map[num][i][x][y].blockages=this.map[num][i][r][c].blockages;
				var cont=0,	mx=x+this.moves[i][0]*coe, my=y+this.moves[i][1]*coe;
				while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][i][mx][my].len==-num){
					cont++;
					mx+=this.moves[i][0]*coe;
					my+=this.moves[i][1]*coe;
				}
				this.map[num][i][x][y].len+=cont;
				if(mx<0||my<0||mx>=15||my>=15||this.map[num][i][mx][my].len==num-1)
					this.map[num][i][x][y].blockages++;
				if(changed.indexOf([x,y])==-1)changed.push([x,y]);
			}
			//compute for the other color
			x=r;
			y=c;
			do{
				x+=this.moves[i][0]*coe;
				y+=this.moves[i][1]*coe;
			}while(x>=0&&y>=0&&x<15&&y<15&&this.map[1-num][i][x][y].len==num-1)
			if(x>=0&&y>=0&&x<15&&y<15&&this.map[1-num][i][x][y].len>0){
				this.map[1-num][i][x][y].blockages++;
				if(changed.indexOf([x,y])==-1)changed.push([x,y]);
			}
		}
		for(var i=0;i<2;i++)for(var j=0;j<4;j++){
			this.map[i][j][r][c].len=-num;
			this.map[i][j][r][c].blockage=2;
		}
	}
	return changed;
}

ai.simulate=function(move, num){
	this.setNum++;
	var r=false;
	for(var i=0;i<4;i++){
		if(this.map[num][i][move.r][move.c].len>4){
			r=true;
			break;
		}
	}
	var changed=this._updateMap(move.r,move.c,num,false);
	var tmp=this.scoreMap[changed[0][0]][changed[0][1]];
	this.sum-=tmp.score;
	tmp.score=this.computeScore(changed[0][0],changed[0][1]);
	for(var i=1;i<changed.length;i++){
		var tmp=this.scoreMap[changed[i][0]][changed[i][1]];
		this.sum-=tmp.score;
		tmp.score=this.computeScore(changed[i][0],changed[i][1]);
		this.sum+=tmp.score;
	}
	return r;
}

ai.desimulate=function(move){
	var changed=this._updateMap(move.r,move.c,0,true);
	var tmp=this.scoreMap[changed[0][0]][changed[0][1]];
	tmp.score=this.computeScore(changed[0][0],changed[0][1]);
	this.sum+=tmp.score;
	for(var i=1;i<changed.length;i++){
		var tmp=this.scoreMap[changed[i][0]][changed[i][1]];
		this.sum-=tmp.score;
		tmp.score=this.computeScore(changed[i][0],changed[i][1]);
		this.sum+=tmp.score;
	}
	this.setNum--;
}

ai.nega=function(move,depth,alpha,beta){
	if(this.simulate(move,(depth+this._add)%2)){
		return -1/0;
	}
	if(this.setNum==225){
		return 0;
	}else if(depth==0){
		return this.sum;
	}
	var tmpqueue=[],tmp;
	for(var i=0;i<this.scorequeue.length;i++){
		tmp=this.scorequeue[i];
		if(tmp.score==-1/0)continue;
		tmpqueue.push(tmp);
	}
	tmpqueue.sort(this.sortMove);
	var l=Math.min(this.totry[depth%2],tmpqueue.length);
	for(var i=0;i<l;i++){
		tmp=tmpqueue[i];
		var score=-this.nega(tmp,depth-1,-beta,-alpha);
		this.desimulate(tmp);
		if(score>=beta){
			return beta;
		}
		if(score>alpha){
			alpha=score;
		}
	}
	return alpha;
}

ai.move=function(){
	postMessage({
		type: 'starting'
	});
	var alpha=-1/0, beta=1/0,bestmove=this.scorequeue[0];
	mc=0;
	for(var i=0;i<15;i++){
		var tmp=this.scorequeue[i];
		if(tmp.score==-1/0){
			break;
		}
		var score=-this.nega(tmp,this.depth,-beta,-alpha);
		this.desimulate(tmp);
		if(score>alpha){
			alpha=score;
			var bestmove=tmp;
		}
	}
	postMessage({
		type: 'decision',
		r: bestmove.r, 
		c: bestmove.c
	});
}

