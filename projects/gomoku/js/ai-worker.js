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
	for(var j=0;j<15;j++){
		var tmpp=[];
		for(var k=0;k<15;k++){
			var tmpr=[];
			for(var l=0;l<4;l++){
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
		this.totry=[200,200];
		break;
		case 'medium':
		this.depth=3;
		this.totry=[18,10];
		break;
		case 'expert':
		this.depth=5;
		this.totry=[13,6];
		break;
		default:
		postMessage({type: 'ini_error', reason: mode+' not supported'});
	}
	postMessage({type: 'ini_complete'});
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
	var mpt=this.map[1-this._add][x][y], opt=this.map[this._add][x][y], i, tmp;
	function sum(prev,elm){
		return prev+elm.len;
	}
	function blocksum(prev,elm){
		return prev+Math.pow(elm.len-1,4)*(2-elm.blockages);
	}
	//set
	i=4;
	while(i--){
		if(mpt[i].len<=0)return -1/0;
	}
	//me 5
	i=4;
	while(i--){
		if(mpt[i].len>4)return 1000000000000;
	}
	//oppo 5
	i=4;
	while(i--){
		if(opt[i].len>4)return -1000000000;
	}

	//me 4 not blocked
	i=4;
	while(i--){
		if(mpt[i].len==4&&mpt[i].blockages==0)return 100000000;
	}
	//me 4 blocked >1
	i=4;
	tmp=0;
	while(i--){
		if(mpt[i].len==4&&mpt[i].blockages==1)tmp++;
	}
	var meFour=false,oppoFour=false;
	if(tmp>1)return 7000000+10*tmp;
	else if(tmp==1)meFour=true;
	//oppo 4 not blocked
	i=4;
	while(i--){
		if(opt[i].len==4&&opt[i].blockages==0)return 4000000;
	}
	//oppo 4 blocked >1
	i=4;
	tmp=0;
	while(i--){
		if(opt[i].len==4&&opt[i].blockages==1)tmp++;
	}
	if(tmp>1)return -(1000000+10*tmp);
	else if(tmp==1)oppoFour=true;
	//me 4 blocked + 3 not blocked
	i=4;
	var meTcount=0;
	while(i--){
		if(mpt[i].len==3&&mpt[i].blockages==0)meTcount++;
	}
	if(meTcount>1&&meFour)return 800000+10*meTcount;
	//oppo 4 blocked + 3 not blocked
	i=4;
	var oppoTcount=0;
	while(i--){
		if(opt[i].len==3&&opt[i].blockages==0)oppoTcount++;
	}
	if(oppoTcount>1&&oppoFour)return -(60000+10*oppoTcount);
	//me 3 not blocked > 1
	if(meTcount>1)return 400000+meTcount*10+mpt.reduce(sum,0);
	//oppo 3 not blocked > 1
	if(oppoTcount>1)return -(300000+oppoTcount*10+opt.reduce(sum,0));
	//me 4 blocked
	if(meFour)return 100000+mpt.reduce(sum,0);
	//oppo 4 blocked
	if(oppoFour)return -(50000+opt.reduce(sum,0));
	//me 3 not blocked
	if(meTcount==1)return 30000+mpt.reduce(sum,0);
	//oppo 3 not blocked
	if(oppoTcount==1)return -(20000+opt.reduce(sum,0));
	//sum
	return (mpt.reduce(blocksum,0)*2-opt.reduce(blocksum,0))*(15-Math.abs(x-7)-Math.abs(y-7));
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
	var changed=[[r,c]],
		moves=this.moves;
	if(remove){
		this.boardarray[r*15+c]='';
		for(var num=0;num<2;num++){
			var pt=this.map[num][r][c];
			for(var i=0;i<4;i++){
				var cpt=pt[i];
				cpt.len=1;
				cpt.blockages=0;
				for(var coe=-1;coe<2;coe+=2){
					var x=r, y=c,len=0;
					do{
						x+=moves[i][0]*coe;
						y+=moves[i][1]*coe;
						len++;
					}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][x][y][i].len==-num)
					if(x>=0&&y>=0&&x<15&&y<15&&this.map[num][x][y][i].len>0){
						var npt=this.map[num][x][y][i];
						npt.len=len;
						cpt.len+=(len-1);
						npt.blockages=0;
						var cont=0,	mx=x+moves[i][0]*coe, my=y+moves[i][1]*coe;
						while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][mx][my][i].len==-num){
							cont++;
							mx+=moves[i][0]*coe;
							my+=moves[i][1]*coe;
						}
						npt.len+=cont;
						if(mx<0||my<0||mx>=15||my>=15||this.map[num][mx][my][i].len==num-1)
							npt.blockages++;
						if(changed.indexOf([x,y])==-1)changed.push([x,y]);
					}else{
						cpt.len+=(len-1);
						cpt.blockages++;
					}
				}
			}
		}
	}else{
		this.boardarray[r*15+c]=num;
		var pt=this.map[num][r][c];
		for(var i=0;i<4;i++)for(var coe=-1;coe<2;coe+=2){
			//compute for the current color
			var x=r, y=c, cpt=pt[i]
			do{
				x+=moves[i][0]*coe;
				y+=moves[i][1]*coe;
			}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][x][y][i].len==-num)
			if(x>=0&&y>=0&&x<15&&y<15){
				var npt=this.map[num][x][y][i];
				if(npt.len>0){
					npt.len=cpt.len+1;
					npt.blockages=cpt.blockages;
					var cont=0,	mx=x+moves[i][0]*coe, my=y+moves[i][1]*coe;
					while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][mx][my][i].len==-num){
						cont++;
						mx+=moves[i][0]*coe;
						my+=moves[i][1]*coe;
					}
					npt.len+=cont;
					if(mx<0||my<0||mx>=15||my>=15||this.map[num][mx][my][i].len==num-1)
						npt.blockages++;
					if(changed.indexOf([x,y])==-1)changed.push([x,y]);
				}
			}
			//compute for the other color
			x=r;
			y=c;
			do{
				x+=this.moves[i][0]*coe;
				y+=this.moves[i][1]*coe;
			}while(x>=0&&y>=0&&x<15&&y<15&&this.map[1-num][x][y][i].len==num-1)
			if(x>=0&&y>=0&&x<15&&y<15){
				var opt=this.map[1-num][x][y][i];
				if(opt.len>0){
					opt.blockages++;
					if(changed.indexOf([x,y])==-1)changed.push([x,y]);
				}
			}
		}
		for(var i=0;i<2;i++){
			var pt=this.map[i][r][c];
			for(var j=0;j<4;j++){
				pt[j].len=-num;
				pt[j].blockage=2;
			}
		}
	}
	return changed;
}

ai.simulate=function(x,y,num){
	this.setNum++;
	var r=false, pt=this.map[num][x][y], i=4;
	while(i--){
		if(pt[i].len>4){
			r=true;
			break;
		}
	}
	var changed=this._updateMap(x,y,num,false);
	
	var tmp=this.scoreMap[changed[0][0]][changed[0][1]];
	this.sum-=tmp.score;
	tmp.score=this.computeScore(changed[0][0],changed[0][1]);
	i=changed.length;
	while(i-->1){
		var tmp=this.scoreMap[changed[i][0]][changed[i][1]];
		this.sum-=tmp.score;
		tmp.score=this.computeScore(changed[i][0],changed[i][1]);
		this.sum+=tmp.score;
	}
	/*
	i=changed.length;
	while(i--){
		this.scoreMap[changed[i][0]][changed[i][1]].score=this.computeScore(changed[i][0],changed[i][1]);
	}*/
	return r;
}

ai.desimulate=function(x,y){
	var changed=this._updateMap(x,y,0,true);
	
	var tmp=this.scoreMap[changed[0][0]][changed[0][1]];
	tmp.score=this.computeScore(changed[0][0],changed[0][1]);
	this.sum+=tmp.score;
	var i=changed.length;
	while(i-->1){
		var tmp=this.scoreMap[changed[i][0]][changed[i][1]];
		this.sum-=tmp.score;
		tmp.score=this.computeScore(changed[i][0],changed[i][1]);
		this.sum+=tmp.score;
	}/*
	i=changed.length;
	while(i--){
		this.scoreMap[changed[i][0]][changed[i][1]].score=this.computeScore(changed[i][0],changed[i][1]);
	}*/
	this.setNum--;
}

ai.sortMove=function(a,b){
	if(a.score==-1/0)return 1;
	if(b.score==-1/0)return -1;
	if(Math.abs(a.score)>Math.abs(b.score)){
		return -1;
	}else{
		return 1;
	}
}

ai.cache={};

ai.nega=function(x,y,depth,alpha,beta){
	//if(this.cache[this.boardarray+''+(depth%2)])return beta;
	if(this.simulate(x,y,(depth+this._add)%2)){
		return -1/0;
	}
	if(this.setNum==225){
		return 0;
	}else if(depth==0){
		/*//mc++;
		var ca=this.cache[this.boardarray];
		if(ca)return ca;
		//dc++;
		var i=this.scorequeue.length,sum=0;
		while(i--){
			var s=this.scorequeue[i].score;
			if(s==-1/0)continue;
			sum+=s;
		}
		this.cache[this.boardarray]=sum;*/
		return this.sum;
	}
	this.scorequeue.sort(this.sortMove);
	var i=this.totry[depth%2], tmp, tmpqueue=[];
	while(i--){
		tmp=this.scorequeue[i];
		if(tmp.score==-1/0)continue;
		tmpqueue.push(tmp.c)
		tmpqueue.push(tmp.r)
	}
	depth-=1;
	var i=tmpqueue.length-1,x,y,b=beta;
	x=tmpqueue[i];
	y=tmpqueue[--i];
	var score=-this.nega(x,y,depth,-b,-alpha);
	this.desimulate(x,y);
	if(score>alpha){
		alpha=score;
	}
	if(alpha>=beta){
		//this.cache[this.boardarray+''+(depth%2)]=true;
		return alpha;
	}
	b=alpha+1;
	while(i--){
		x=tmpqueue[i];
		y=tmpqueue[--i];
		var score=-this.nega(x,y,depth,-b,-alpha);
		this.desimulate(x,y);
		if(alpha<score && score<beta){
			mc++;
			var score=-this.nega(x,y,depth,-beta,-alpha);
			this.desimulate(x,y);
		}
		if(score>alpha){
			alpha=score;
		}
		if(alpha>=beta){
		//this.cache[this.boardarray+''+(depth%2)]=true;
			return alpha;
		}
		b=alpha+1;
	}
	return alpha;
}

ai.move=function(){
	mc=0;
	//dc=0;
	ai.cache={};
	postMessage({
		type: 'starting'
	});
	var alpha=-1/0, beta=1/0,bestmove=[this.scorequeue[0].r, this.scorequeue[0].c];
	var i=23, tmp, tmpqueue=[],depth=this.depth;
	while(i--){
		tmp=this.scorequeue[i];
		if(tmp.score==-1/0)continue;
		tmpqueue.push(tmp.c)
		tmpqueue.push(tmp.r)
	}
	var i=tmpqueue.length-1,x,y,b=beta;     
	x=tmpqueue[i];
	y=tmpqueue[--i];
	var score=-this.nega(x,y,depth,-b,-alpha);
	this.desimulate(x,y);
	if(score>alpha){
		alpha=score;
		var bestmove=[x,y];
	}
	b=alpha+1;
	while(i--){
		x=tmpqueue[i];
		y=tmpqueue[--i];
		var score=-this.nega(x,y,depth,-b,-alpha);
		this.desimulate(x,y);
		if(alpha<score && score<beta){
			var score=-this.nega(x,y,depth,-beta,-alpha);
			this.desimulate(x,y);
		}
		if(score>alpha){
			alpha=score;
			var bestmove=[x,y];
		}
		b=alpha+1
	}
	postMessage(mc);
	postMessage({
		type: 'decision',
		r: bestmove[0], 
		c: bestmove[1]
	});
}

