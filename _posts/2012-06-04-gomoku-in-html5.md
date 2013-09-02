--- 
name: gomoku-in-html5
layout: post
title: Gomoku In HTML5
time: 2012-06-04 16:30:00 +08:00
category: Projects
tags:
  - html5
  - games
  - html
  - javascript
  - gomoku in html5
---

*Update: I have open sourced this game on [Github](https://github.com/yyjhao/HTML5-Gomoku)*

*You can play the game [here](http://gomoku.yjyao.com/), or install it from [Chrome Web Store](https://chrome.google.com/webstore/detail/ngbpiahelilpgbnonpjfaoegaigopepa).*

*It also supports Mobile Safari!*

Gomoku is one of the very few board games I actually play and get
to win sometimes. Since it's a game with perfect information and very 
simple rules, I thought it should be easy to make an AI for it, so I coded
this game.

This game allows playing against human (on the same computer) or against AI with three 
different difficulties.

<img src='/images/gomoku-1.png' class='center' />

The dialogs and button are built using [jQuery Mobile](http://jquerymobile.com). It wasn't
quite ideal though, as I have to disable transition animation in order to avoid the lagginess
on Mobile Safari.

The game interface is built using CSS3, and only two images are used for the background pattern. 
I used radial gradients for the go pieces and some CSS box-shadows to make the board look more sleek.

<img src='/images/gomoku-2.png' class='center' />

For the AI, I used the negascout algorithm together with a little bit of transportation table
implemented using Javascript Object. Using a scripting language like Javascript, it was 
difficult to build a fast AI. So there was some trade off on the strength for performance.
The game was only able to search deepest for 8-ply (for expert level) and in each level it searches
for around 10-20 'best moves'. The moves are ranked based on their score, which depends on 
how possibile the empty space can be used to form a 'five' if a piece is set on it. The evaluation
function is then the sum of all the scores of the empty places (if neither side wins yet), with
a positive weighting for the AI and a negative weighting for the player. This method is better
than my previous method that detects 'connection', in that it can better detect and form 'disconnected' threat patterns like "&#42;&#42; &#42;". 

Because the AI is slow, the game will freeze during the computation of moves. As such, I implemented the AI
with HTML5 Web Worker, which is like multi-threading, to make sure that the interface is responsive. I also implemented offline cache which will allow users to play the game offline.

Of course the game can still be improved - at least I haven't tried the history heuristic, nor some more
advnace AI algortithms than negascout. I think it is also possible to implemente the core AI in C++ with the interface written in HTML5. But it won't be a browser game any more.