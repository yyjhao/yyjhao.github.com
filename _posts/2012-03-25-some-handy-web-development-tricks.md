---
name: some-handy-web-development-tricks
layout: post
title: Some Handy Web Development Tricks
time: 2012-03-25 12:30:00 +08:00
category: Tutorials
tags:
   - html5
   - css3
---
In this post, I would like to share some small but useful tricks I found in web development. 

<ol>
<li>
	<header>Set up a simple server locally. </header>
	<p>For front-end web developers, setting up a PHP and mess around with all the web configurations is just inconvenient. But certain features, like XHttpRequest and web workers, are just not supported by some browsers when the page is accessed locally. Luckily Python has a really interesting utility:
	</p>
{% highlight bash %}
python -m SimpleHTTPServer 8000
{% endhighlight %}
<p>
   	Run this in the directory of the web page, and you can access it on 127.0.0.1:8000!
	</p>
</li>
<li>
	<header>Speed up animations</header>
	<p>This is just a trick to force the browser to enable GPU acceleration on the element - the effect of it is especially significant on mobile browsers like mobile safari:
	</p>
{% highlight css %}
.animate{
	-webkit-transform: translateZ(0);
	-moz-transform: translateZ(0);
	-ms-transform: translateZ(0);
	-o-transform: translateZ(0);
	transform: translateZ(0);
}
{% endhighlight %}
</li>
<li>
	<header>Force IE to render your page with a better engine</header>
	<p>
		Sometimes even using the html5 doctype is not enough for our quirky IE. So it's a good idea to have this meta tag in the html header:
	</p>
{% highlight html %}
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
{% endhighlight %}
	<p>
		This will force IE to render the page with the lastest engine available. What's more, it will enable chrome frame if it's installed.
	</p>
</li>
<li>
	<header>Make your <code>::active</code> work on mobile browsers</header>
	<p>Add a <code>ontouchstart</code> event to the body tag, as shown below:
	</p>
{% highlight html %}
<body ontouchstart="">
	stuff here
</body>
{% endhighlight %}
</li>
</ol>   