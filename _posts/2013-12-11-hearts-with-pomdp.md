--- 
name: hearts-with-pomdp
layout: post
title: Hearts with POMDP
time: 2013-12-11 11:30:00 +08:00
category: Projects
tags:
  - javascript
  - hearts
  - ai
  - html5
  - games
---

*This project is hosted on [Github](https://github.com/yyjhao/html5-hearts)*

*Also try here: [http://hearts.yjyao.com](https://github.com/yyjhao/html5-hearts)*

Hearts is one of the few card games that I know how to play, thanks to
Microsoft Windows and the countless boring hours. So based on what I have done
- [Gomoku](/tags/gomoku-in-html5) and [solitaire](/tags/solitaire-three-in-one),
it seems natural to fuse the two and write a hearts card game with AI.

It turns out that Hearts is a lot trickier than the simple Gomoku - 
it's multiplayer and not fully observable (you can't see everyone's cards), which
means that a naive implementation of Minimax is either going to be bad or slow.

So the easiest approach will be a simple heuristic - something along the line
of always play the smallest possible card to avoid taking in points and so on.
This simple greedy heuristic actually can perform quite well against amateur
players - probably the majority people who actually play hearts against a computer.

However, if we know exactly how the computer is going to play, surely it must be
a lot easier for us to beat it! Here's where POMDP comes in. [POMDP](http://en.wikipedia.org/wiki/Partially_obs ervable_Markov_decision_process)
stands for Partially Observable Markov Decision Process. Here if we assume that all
other players play with a fixed strategy, then the game becomes a Markov Decision
Process - after a move we make, the other three players will play according to
the cards they have and the cards that are currently on the table. So the state - 
the cards and score each has, will be updated based on the current state - clearly
a Markov Decision Process. Then of course, the state is partially observable, as we
have discussed, so we can formulate the game as a POMDP process.

One algorithm to solve POMDP problems (by achieving an optimal result)
is aclled POMCP (confusing names, yes), which uses a Monte-Carlo rollout as
the evaluation function for the terminal node and builds a tree by expanding
the most promising nodes at each stage.  More details can be found [here](http://machinelearning.wustl.edu/mlpapers/paper_files/NIPS2010_0740.pdf).

Of course, actual human players can employ different strategies. So the assumption
here is that such a formulation can serve as a reasonable approximation. This is hard
to test though, so you can find out the performance for yourself by [playing the game](http://hearts.yjyao.com).

You can check out the source code from the link in the beginning of this post. If you
are interested in more technical details, feel free to read [my report](/res/hearts.pdf).