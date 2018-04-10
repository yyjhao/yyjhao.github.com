---
name: nus-ivle-downloader
layout: post
title: NUS IVLE Downloader
time: 2012-08-31 21:00:00 +08:00
category: Projects
tags:
  - qt
  - nus
  - ivle
  - nus ivle downloader
---
<div class="update-box">
<strong>Update</strong>
<p>This app has stopped working as the school revamps the IVLE API and limits the poll rate.
This can be fixed by updating the code, but as I have graduated there is no easy way for me to test.</p>
<p>If you or friends of you wants to fix this, let me know and I am happy to pass on the project. It's open source anyway.</p>
</div>

*This project is hosted on [Github](https://github.com/yyjhao/IVLEDownloader)*

To me, it's a great hassle to click links to download files from workbins, then move them into
a proper folder, and try to remember what the latest files were.

So I coded this Dropbox-like solution to free myself (and countless hardworking students) from this
extremely time-consuming task. May I introduce to you-

<b>THE NUS IVLE Downloader!</b>

This is small daemon that keeps running in the background to check and update your workbin files, then
arrangement them nicely into a folder.

Clicking (or right clicking in the case of Windows) the icon gives you the following menu items:

<img src='/images/ivledownloader-1.png' class='center' />

The grey item shows you the current status, it can be things like "10 files remaining", if it's downloading,
or "All files up to date", if the process is done. You can force an update by clicking "Update now". The
"Recently downloaded files" item gives you a list of 5 recently downloaded files, so you can do your
new tutorials, read your new lecture notes etc. pretty conveniently.

Clicking open shows you the following window, which is basically a log of all the files IVLE Downloader
has downloaded.

<img src='/images/ivledownloader-2.png' class='center' />

Then there's the settings windows, as shown below:

<img src='/images/ivledownloader-3.png' class='center' />

Obviously you will be asked to log in and set a downloading folder before you can download anything. Just note that
once the information is complete, the downloader will start right away.

##Auto-start:
This is perhaps an important feature that's not implemented. If you use Windows, please drag a shortcut link into
your start-startup folder. If you are using Mac, go to System Preference->User Group and Login->Login items and add
this app. If you are a Linux user, well, go figure it out yourself! (no offense, but that's the linux spirit, isn't it?)

##Note to Windows Users:

Please drag the system tray icon out from the hidden area, as shown here:

<img src='/images/ivledownloader-4.png' class='center' />

##Downloads(finally):
* The source code is available on Github: [https://github.com/yyjhao/IVLEDownloader](https://github.com/yyjhao/IVLEDownloader).
* **Update:** New version is available <a href="https://github.com/yyjhao/IVLEDownloader/releases/tag/V1.1">here</a>

Note that since the app is not code-signed, Mac users have to go to System Preferences->Security&Privacy and choose "Allow application download from Anywhere"(you may need to unlock this option by clicking the little lock on the bottom left.), or Apple will not let you run this app.

##Technical Stuff:

This app is written in C++ with Qt (so it can be compiled and run on all major platforms).

It also uses the awesome [IVLE LAPI](http://wiki.nus.edu.sg/display/ivlelapi/Module) from NUS.

You can get more technical stuff from the Github page.
