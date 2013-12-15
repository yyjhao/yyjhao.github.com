--- 
name: markmon-a-markdown-previewer
layout: post
title: Markmon - a fast markdown previewer
time: 2013-12-13 19:30:00 +08:00
category: Projects
tags:
  - javascript
  - markmon
  - markdown
  - mathjax
  - socket.io
  - node.js
---

*[Github link](https://github.com/yyjhao/markmon)*

If you use markdown often, chances are that you also use some sort of markdown previewers. Unfortunately, most of them simply generate the HTML and refresh the content when there's an update - which is fine for a lot of use cases, but not when you need to do some post-processing like MathJax.

So this is why I built Markmon, because I often need to use the math in my assignments.

![](/images/markmon.png)

The problem with refreshing page is that it will take some time to load up the MathJax library again (even if it's cached by the browser), and then some other time for MathJax to typeset the math expressions yet again. This is annoying when you want to have *real-time* preview of the document.

One way to avoid doing this unnecessary post-processing is to update the DOM through diff-ing. This means that we only update the DOM through a minimum number of insertions and deletions of DOM nodes. Turns out diff-ing is quite easy. Notice that a DOM is a small ordered tree (a tree where childnodes are ordered), so a recursive version of the Needleman–Wunsch algorithm will suffice. If you haven't heard of it yet, check out this [link](http://en.wikipedia.org/wiki/Needleman-Wunsch_algorithm). My modification is just to set the cost of editing a node to another node as the alignment cost of their child nodes, recursively.

With the diff data, we can then apply the edit on the DOM and all math expressions will remain intact! So MathJax will only need to be run on new nodes, and this typically takes very little time.

The last part is to build the actual previewer itself. It will be perfect if we can implement all these with HTML5. Unfortunately, we also need some access to the system for things like watching the file for changes and running the markdown converter (I use pandoc, by the way). A solution for JavaScript fanatics like me is to use Node.js and set up a local server. The passing of data (mainly, the generated html snippets) can be done with socket.io, since we need the server, which watches the file, to update the client in real-time.

So here's the final app: a command-line initiated daemon/server that watches the markdown file and converts it to html and send it to clients via socket.io. The client is simply a web frontend which then uses JavaScript to diff the DOM and apply the appropriate update. 

