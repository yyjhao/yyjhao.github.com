--- 
name: colorful-cowsay-in-your-terminal
layout: post
title: Add some colorful cowsay to your terminal
time: 2014-9-20 23:30:00 +08:00
category: Tutorial
tags:
  - bash
  - terminal
  - geek
---

So I often get asked about my terminal because it's a little bit flamboyant:

<img alt="" src="/images/cowsay-terminal.png" />

So today I am going to write about how this can be achieved.

Here's the tools that you need: `cowsay`, `fortune`, `gshuf` and `lolcat`.

`cowsay`, `fortune` and `gshuf` are binaries so depending on your OS, you can use your package manager to install them. `lolcat` is a `ruby gem` so you will need to [install ruby](https://www.ruby-lang.org/en/installation/) first, then do you usual `gem install lolcat`.

After that, add the following line to your `.bashrc` (or `.bash_profile`) if you are using a Mac.

{% highlight bash %}
fortune | cowsay -f $(cowsay -l | tail -n +2 | tr ' ' '\n' | gshuf -n 1) | lolcat
{% endhighlight %}

Note that `/usr/local/share/cows` depends on your `cowsay`'s cowfiles, which you can find out by running `cowsay -l` in your terminal.

This line basically pipes a random fortune to a random 'cow', then to `lolcat`, which adds colors. The slowest part is `lolcat` because it's ruby, but most of the time the delay is acceptable given the nice final effects.

Hope this is useful =)