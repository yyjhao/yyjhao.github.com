window.onload=function(){
	var cv=document.querySelector('#wahaha'),
		ct=cv.getContext('2d');
	cv.width=window.innerWidth;
	cv.height=window.innerHeight;
	mouseposes=[];
	if('ontouchstart' in document){
		document.ontouchstart=function(e){
			mouseposes=[];
			for(var i=0;i<e.touches.length;i++){
				mouseposes.push([e.touches[i].clientX,e.touches[i].clientY]);
			}
			e.preventDefault();
		}
		document.ontouchmove=function(e){
			e.preventDefault();
			mouseposes=[];
			for(var i=0;i<e.touches.length;i++){
				mouseposes.push([e.touches[i].clientX,e.touches[i].clientY]);
			}
		}
		document.ontouchend=function(e){
			e.preventDefault();
			mouseposes=[];
		}
	}else{
		document.onkeydown=function(e){
			if(e.which==65){
				for(var i=0;i<1000;i++){
					particles.push(new particle(
						Math.floor(Math.random()*w/2)+w/4,
						Math.floor(Math.random()*h/2)+h/4,
						w,
						h
						));
				}
			}else if(e.which==82){
				if(particles.length>1000)particles.length-=1000;
			}
		}
		document.onmousedown=function(e){
			mouseposes.push([e.pageX,e.pageY]);
		}
		
		document.onmouseout=function(){
			mouseposes=[];
		}
		
	}
	
	var h=cv.height,
		w=cv.width;
		
	var particles=[];
	for(var i=0;i<6000;i++){
		particles.push(new particle(
			Math.floor(Math.random()*w/2)+w/4,
			Math.floor(Math.random()*h/2)+h/4,
			w,
			h
			));
	}
	setInterval(function(){
		var img=ct.createImageData(w,h);
		//var img=ct.getImageData(0,0,w,h);
		for(var i=0;i<particles.length;i++){
			particles[i].update();
			particles[i].draw(img.data);
		}
		ct.putImageData(img,0,0);
	}, 20);
}

friction=1-1/60;

function particle(x,y,w,h){
	this.pos=[x,y];
	this.color=[];
	var sum=0;
	for(var i=0;i<3;i++){
		var a=Math.floor(Math.random()*255);
		this.color.push(a);
		sum+=a;
	}
	this.color.push(1050-sum);
	this.color.push(255);
	this.speed=[Math.random()*10-5,Math.random()*10-5];
	this.boundary=[w,h];
	this.previousPos=[];
	this.attr=Math.random()*60+70;
}

particle.prototype={
	update: function(){
		this.previousPos.push([this.pos[0],this.pos[1]]);
		if(this.previousPos.length>3){
			this.previousPos.shift();
		}
		var c=this.pos,
			boundary=this.boundary,
			f=friction,
			s=this.speed;
		for(var iii=0;iii<mouseposes.length;iii++){
			var mousepos=mouseposes[iii],
				r=[mousepos[0]-c[0],mousepos[1]-c[1]],
				dis=Math.sqrt(r[0]*r[0]+r[1]*r[1]),
				sr=this.attr/Math.pow(dis,2)/Math.sqrt(mouseposes.length);
			for(var i=0;i<2;i++){
				this.speed[i]+=sr*(r[i]+r[(i+1)%2]*(1-2*i)*10000/dis/dis);
			}
		}
		var ss=Math.sqrt(s[0]*s[0]+s[1]*s[1]);
		if(ss>15){
			for(var i=0;i<2;i++){
				s[i]=s[i]/ss*15;
				c[i]=Math.round(c[i]+s[i]+boundary[i])%boundary[i];
			}
		}else{
			for(var i=0;i<2;i++){
				s[i]*=f;
				c[i]=(c[i]+s[i]+boundary[i])%boundary[i];
			}
		}
	},
	draw: function(img){
		var d=function(x,y,c,w){
			var p=w*4*Math.round(y)+4*Math.round(x);
			for(var i=0;i<4;i++){
				img[i+p]+=c[i];
			}
		}
		d(this.pos[0],this.pos[1],this.color,this.boundary[0]);
		for(var i=this.previousPos.length-1;i>-1;i--){
			var p=this.previousPos[i];
			this.color[3]-=50;
			d(p[0],p[1],this.color,this.boundary[0]);
		}
		this.color[3]=255;
	}
};
