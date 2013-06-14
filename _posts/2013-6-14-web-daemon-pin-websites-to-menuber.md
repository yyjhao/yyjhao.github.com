--- 
name: web-daemon-pin-websites-to-menubar
layout: post
title: Web Daemon - Pin Websites to Menubar
time: 2013-6-14 22:30:00 +08:00
category: Projects
tags:
  - javascript
  - objecitve-c
  - cocoa
  - mac
  - css
  - web daemon
---

*This project is hosted on [Github](https://github.com/yyjhao/Web-Daemon)*

<img class='float-left' height="150" src="/images/webdaemon.png" title="web daemon" width="150" /></a>

This is a convenient Mac app I made quite some time ago. The idea is based on
my previous app [treb](../../2011/08/run-google-task-google-plus-in-your.html),
but this time it is Mac only and not Qt-based
cross-platform, because I found Qt Webkit to be rather inadequate.

Anyway, Web Daemon allows you to pin 'small versions' of websites into your
status bar. You can pin as many as you like, so long as your menubar is long enough,
and that you don't mind it drains your battery.

You can download the unsigned (because I am a poor student who can't afford Apple's membership)
app [here](http://sourceforge.net/projects/webdaemon/files/Web%20Daemon.app.zip/download).

<img class="center" src="/images/webdaemon-1.png" />

Clicking an icon will open the page. You can click the home button to 'refresh'. Clicking
the button on the bottom right allows you to toggle between the 'bigger' and 'smaller' version
of the website. The button next to the home button lets you open the page in your browser.

<img class="center" src="/images/webdaemon-2.png" />

When browsing, use two-finger swipe to go backward and forward, just like in Safari. Holding command
while clicking a link lets you open the link in your browser.

To setup, right click any icon, and click preference, you can then add, remove or disable
any web pages.

<img class="center" src="/images/webdaemon-3.png" />

Set up a website is easy. Start by typing in a name, most of the time, the urls will be
auto-filled for you! You can also specify an icon. If no icon is specified, the favicon will
be used.

<img class="center" src="/images/webdaemon-4.png" />

And here's something for those who knows web technology: you can inject stylesheets and javascripts!
Simply specify those
in the text area. Web Daemon also provides a custom javascript object `window.WebDaemon`. It provides
two functions: `grabAttention` and `cancelAttention` and an attribute `shouldReplaceHost` (which can only
be modified/accessed with the setter/getter functions `setShouldReplaceHost(bool)` and `shouldReplaceHost()`).

The first two functions allow the websites to notify the user. Notification is simply a sound with the icon turned red.
`cancelAttention` simply reverts the red color back to the normal gray-scale.

I created this functionality initially for things like facebook/twitter etc. But turns out that it's no longer
needed now that we have native notification, so I will just leave it here for now.

`shouldReplaceHost` tells the app whether it should replace the host of the link from the mobile version
to the desktop version. For example, if you command-click the facebook photo links, it will open
the mobile version of facebook in your browser, which is weird. So if you inject

{% highlight js %}
WebDaemon.setShouldReplaceHost(true);
{% endhighlight %}

then when command-clicking the links, the photos will be opened in the desktop version of facebook
in your browser.

## Some technicalities

I learned from [Shpakovski's example](http://github.com/shpakovski/Popup) to build the popup interface. I also used [Tony Million's Reachability](https://github.com/tonymillion/Reachability) library
to update the webpage when network connection goes live, though it does not work quite as well during
my tests.

The icon is inspired by Twitter (if you notice ;P ).

And ok the code quality is pretty abysmal... I shall see if there is a need for me to improve it.

If you want to see the source code, the github link is up there near the title.
