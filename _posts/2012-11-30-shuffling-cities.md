--- 
name: shuffling-cities
layout: post
title: Shuffling Cities
time: 2012-11-30 22:00:00 +08:00
category: Others
tags:
  - javascript
  - algorithms
  - work
  - nonstop-games
---
So I am currently interning at [NonStop Games](http://nonstop-games/), an awesome startup that focuses on mobile and social gaming using HTML5 technology and node.js. And here's an image about an ultra-secret project we are currently working on:

<a href="http://nonstop-games.com/2012/07/game-iv-reinventing-social-games"><img src="http://nonstop-games.com/wp-content/uploads/2012/06/game4.1.jpg" /></a>

Anyway, recently I was assigned a task to write a world map generator for this game, and I thought the algorithm I came up with is worthy of a blog post ;)

*Please note that all codes in this post have been simplified and re-written, so there might be bugs ;P*

The map is two-dimensional with quite a large size (hundreds of tiles on each side), and the generator should fill it with cities and various terrain tiles. Here I am only going to talk about the cities because the part about terrains was less interesting.

Of course, the first step is to implement a [deck shuffling algorithm](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle). We just need a small tweak here: transform the two-dimensional map into a one-dimensional array. Here's a rough sample of the code:

{% highlight js %}
// note that randomList is an array that contains all tiles in the map
// the ordering does not matter but we can just copy them iteratively
for ( var i = randomList.length - 1; i >= 0; i-- ){
	var p = Math.floor( Math.random() * i );
	randomList[p].isCity = true;
	var tmp = randomList[i];
	randomList[i] = randomList[p];
	randomList[p] = tmp;
	// by the way, we can pop the last element instead of swapping, see code below
}
{% endhighlight %}

But there are some specifications about the cities: we do not want two cities to be too close, nor a city to be too far away from its neighboring cities - this will create bad gaming experience for the players. So we need to enforce a shortest distance `s` and a longest distance `l` between cities in the *random* generation.

To enforce a shortest distance is easier: we just need to modify the routine that removes the element after it is selected. So other than removing the tile that is marked as a city, we also remove all the tiles around the city that are within the shortest distance.

But now we need an extra attribute: in order to ensure that we can 'find' the surrounding tiles in the random list from a two dimensional map we used to find nearby tiles, we now need to label all the tiles with their positions in the random list. So we add a `pos` attribute to the tiles and update it whenever we do a swap. 

Also, we now need to reduce the size of the random list by more than just one per iteration, since we are removing (possibly) more elements that just the one tile we select. As a result, we are no longer using the for-loop above, and it appears to be more convenient if we just pop away those removed elements.

So now the code roughly looks like this:

{% highlight js %}
while( randomList.length > 0 ){
	var p = Math.floor( Math.random() * i );
	randomList[p].isCity = true;
	var toRemove = getPosOfTilesAround(randomList[p], s);
	toRemove.push(p);
	for( var i = 0; i < toRemove.length; i++ ) {
		var pos = toRemove[i];
		randomList[pos].removed = true;
		randomList[pos] = randomList.pop(); // don't need to swap, just pop the repeated item
		randomList[pos].pos = pos; // update the pos
	}
}
{% endhighlight %}

To implement `getPosOfTilesAround` function, we can simply do a Breadth First Traversal on the two dimensional representation of the map. Note that we will filter away all tiles that are marked as removed.

So we come to the last part of the generation routine - how to make sure that cities are not too far away? My solution is to maintain a 'priority list' that contains tiles that 'should' be chosen as cities. That is, when we mark a tile as a city, other than removing the closer tiles, we also place another ring of tiles within the 'longest distance' into a list that has a higher priority of being picked. So now we will only select tiles in the priority list, and only proceed to select tiles in the random list if the priority list is empty. This will in theory ensure that for every city, there will be at least one other city within the longest distance specified. And in practice, there will almost always be enough cities within the longest distance.

There's just one last minor tweak: we don't need to create another list as the 'priority list' - we can just place all the elements of the priority list at the front of the random list and maintain a 'cut-off point', i.e. the length of the priority list.

But now the removal becomes a bit more complicated:
1.If the element is not in the priority list, it's just like before
2.otherwise we can't just replace the tile with the list tile because the last tile may not be in the priority list. So we do the following:
	1.Swap the tile with the last tile in the priority list
	2.Decrease the size of the priority list
	3.Now the tile to be removed is in the normal list, so again we proceed just like before

So here is the final outline: 

{% highlight js %}
var priorityListlen = 0; // at first we don't have any priority tiles yet
while(randomList.length > 0){
	var within = priorityListLen || randomList.length;
	var p = Math.random() * within >> 0;
	randomList[p].isCity = true;
	var toRemove = getPosOfTilesAround(randomList[p], l, s);
	for(var i = 0; i < toRemove.length; i++){
		var pos = toRemove[i],
			r = randomList[pos];
		if(pos < priorityListLen){
			priorityListLen--;
			var tmp = randomList[priorityListLen];
			tmp.pos = pos;
			randomList[priorityListLen] = r;
			r.pos = priorityListLen;
			randomList[pos] = tmp;
		}
		if(r.pos + 1 === randomList.length){
			randomList.pop();
		}else{
			var replace = randomList.pop();
			replace.pos = r.pos;
			randomList[r.pos] = replace;
		}
	}
}
{% endhighlight %}

Just as an illustration, here's a map with `s = 3` and `l = 4` (grey ones are cities)

<img src='/images/world.png' class='center' />