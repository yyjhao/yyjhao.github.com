--- 
name: a-silly-alarm-clock-in-html
layout: post
title: A Silly Alarm Clock in HTML
time: 2012-09-07 23:45:00 +08:00
category: Projects
tags:
  - html5
  - javascript
  - css3
  - concept
  - alarm clock in html
---
*This project is hosted on [Github](https://github.com/yyjhao/alarm.html)*

I have embeded the page below, but you can also directly access it [here](/projects/alarm/main.html)

<iframe height='480' style='width: 100%; max-width:360px; margin: 2em auto; display: block; border: 5px solid' src='/projects/alarm/main.html' frameborder="0" >
	<p>Eh iframe not supported?</p>
</iframe>

I have made this alarm clock, but I am a bit tired of it so I just release this partially finished app as a demo/concept.

As you can see, this is an alarm clock designed to be mobile-friendly (though I don't really think people will *actually* use a *HTML5* alarm clock on smart phones or tablets :P). But I realised that it will be really hard to make it work on iOS because of [Apple's restriction on HTML5 Audio/Video playing](http://stackoverflow.com/questions/4259928/how-can-i-autoplay-media-in-ios-4-2-1-mobile-safari).

Still I think this app is quite fun. It recognize the time in (somewhat) natural language. Strings like "in a minutes", "after 2 hours", "12:12", "8:12pm" can all be used to set the time the alarm clock should go off, though it still cannot recognize words of numbers (only pure numbers are supported, other than 'a' and 'an'), so "in two minutes" will not work :( The interface also uses a lot of CSS3 animation and 3D transitions so (imo) it looks quite nice in browsers that support these features.

Also it's working quite nicely with a Mac App I am currently developing, so I finally have an alarm clock daemon!

<img src='/images/alarm.png' class='center'/>

By the way, the source code is available on Github (link above).