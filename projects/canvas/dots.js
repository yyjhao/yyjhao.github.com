window.onload=function(){
	var cv=document.querySelector('#wahaha'),
		ct=cv.getContext('2d');
	cv.width=window.innerWidth;
	cv.height=window.innerHeight;
	mousepos=[0,0];
	if('ontouchstart' in document){
		coe=1;
		document.ontouchstart=function(e){
			if(event.touches.length%2){
				coe=1;
			}else{
				coe=-5;
			}
			mousepos=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];
			e.preventDefault();
		}
		document.ontouchmove=function(e){
			e.preventDefault();
			mousepos=[e.changedTouches[0].clientX,e.changedTouches[0].clientY];
		}
		document.ontouchend=function(e){
			e.preventDefault();
			coe=0;
		}
		document.querySelector('#changePaint').ontouchstart=function(){this.onclick()};
		
		document.querySelector('#rough').ontouchstart=function(){this.onclick()};
		document.querySelector('#smooth').ontouchstart=function(){this.onclick()};
		document.querySelector('#add').ontouchstart=function(){this.onclick()};
		document.querySelector('#remove').ontouchstart=function(){this.onclick()};
	}else{
		document.onmousemove=function(e){
			mousepos=[e.pageX,e.pageY];
		}
		
		document.onmousedown=function(e){
			if(e.target===cv)coe=-5;
		}
		
		document.onmouseup=function(){
			coe=1;
		}
		
		document.onmouseout=function(){
			coe=0;
		}
		
		document.onmouseover=function(){
			coe=1;
		}
	}
	
	document.querySelector('#changePaint').onclick=function(){
		repaint=!repaint;
		if(repaint){
			this.innerHTML="Let's paint!";
		}else{
			this.innerHTML="Let's move!";
		}
	}
	
	document.querySelector('#rough').onclick=function(){
		if(friction*2>1)return;
		friction*=2;
	}
	document.querySelector('#smooth').onclick=function(){
		friction/=2;
	}
	document.querySelector('#add').onclick=function(){
		circles.push(new circle(
			Math.random()*100000+50000,
			Math.random()*40+11,
			Math.floor(Math.random()*30)+20,
			Math.floor(Math.random()*w/2)+w/4,
			Math.floor(Math.random()*h/2)+h/4,
			w,
			h)
			)
		document.querySelector('#ndot').innerHTML=circles.length;
	}
	document.querySelector('#remove').onclick=function(){
		circles.length--;
		document.querySelector('#ndot').innerHTML=circles.length;
	}
	
	var h=cv.height,
		w=cv.width;
		
	var circles=[];
	for(var i=0;i<75;i++){
		circles.push(new circle(
			Math.random()*100000+50000,
			Math.random()*40+11,
			Math.floor(Math.random()*30)+20,
			Math.floor(Math.random()*w/2)+w/4,
			Math.floor(Math.random()*h/2)+h/4,
			w,
			h)
			)
	}
	document.querySelector('#ndot').innerHTML=circles.length;	
	setInterval(function(){
		if(repaint)ct.clearRect(0,0,w,h);
		for(var i=0;i<circles.length;i++){
			circles[i].update();
			circles[i].draw(ct);
		}
	}, 20);
}

coe=0;
friction=1/400;
repaint=true;

function circle(mouseAttrac,radius,colTime,x,y,w,h){
	this.mouseAttrac=mouseAttrac;
	this.radius=radius;
	this.center=[x,y];
	this.nextColor=[];
	this.color=[133,213,20,0.3];
	this.speed=[Math.random()*10-5,Math.random()*10-5];
	this.colorSpeed=[];
	this.colorTime=colTime;
	this.lastPos=[];
	this.boundary=[w,h];
}

circle.prototype={
	update: function(){
		if(this.colorSpeed.length===0){
			for(var i=0;i<4;i++){
				this.nextColor[i]=Math.floor(Math.random()*255);
				if(i===3)this.nextColor[i]/=255;
				this.colorSpeed.push((this.nextColor[i]-this.color[i])/this.colorTime);
			}
			this.colorStep=this.colorTime;
		}else{
			for(var i=0;i<4;i++){
				this.color[i]+=this.colorSpeed[i];
			}
			this.colorStep--;
			if(this.colorStep===0){
				this.colorSpeed=[];
			}
		}
		var c=this.center,
			r=[mousepos[0]-c[0],mousepos[1]-c[1]],
			dis=Math.sqrt(r[0]*r[0]+r[1]*r[1]),
			sr=this.mouseAttrac/Math.pow(dis,3),
			boundary=this.boundary,
			f=friction,
			s=this.speed,
			ra=this.radius;
		if(sr>1/50)sr=1/50;
		for(var i=0;i<2;i++){
			this.speed[i]+=coe*sr*r[i];
		}
		for(var i=0;i<2;i++){
			s[i]-=f*s[i];
			c[i]=Math.round(c[i]+s[i]);
			if(c[i]<ra || c[i]+ra>boundary[i]){
				if(c[i]<ra){
					c[i]=ra+1;
				}else{
					c[i]=boundary[i]-ra-1;
				}
				s[i]*=-0.9
			}
		}
	},
	draw: function(ct){
		ct.beginPath();
		ct.arc(this.center[0],this.center[1],this.radius,0,Math.PI*2,true);
		ct.closePath();
		ct.fillStyle=this.toColor();
		ct.fill();
	},
	toColor: function(){
		return 'rgba('+Math.floor(this.color[0])+','+Math.floor(this.color[1])+','+Math.floor(this.color[2])+','+this.color[3]+')';
	}
}
