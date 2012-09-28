microdata.reveal
================

A Chrome browser extension to display embedded microdata to the user.

## Description ##

This extension will parse the currently loaded page, and indicate by the colour of the icon whether the page contains [HTML microdata](http://www.w3.org/TR/microdata/) (green) or whether it contains no microdata (grey).

By clicking on the icon, a popup is displayed showing a tabular view of the microdata, similar to [Google's Rich Snippets tool](http://www.google.com/webmasters/tools/richsnippets).

The user can also choose to see a JSON representation of the microdata.

The code for this extension is available at [https://github.com/cwa-lml/microdata.reveal](https://github.com/cwa-lml/microdata.reveal)

![Microdata.reveal screenshot](microdata.reveal/raw/master/microdata.reveal.screenshot.png  "Microdata.reveal screenshot")

This code can be run in non-chrome browsers by including the following in the <head>:

        <script src="microdata.reveal/lib/jquery-1.6.4.min.js"></script>
        <script src="microdata.reveal/lib/json2.js"></script>
        <script src="microdata.reveal/lib/microdatajs/jquery.microdata.js"></script>
        <script src="microdata.reveal/lib/microdatajs/jquery.microdata.json.js"></script>
        <script src="microdata.reveal/lib/json-template.js"></script>
        <script src="microdata.reveal/lib/messi/messi.min.js"></script>
        <link rel="stylesheet" href="microdata.reveal/microdata.reveal.css" />
        <script src="microdata.reveal/tmpl.microdata.js"></script>
        <script src="microdata.reveal/microdata.reveal.js"></script>

## Credits ##

This code is built on the following efforts:

* [Jquery](http://jquery.com/)
* [Messi](http://marcosesperon.es/apps/messi/)
* [Microdata.js](http://gitorious.org/microdatajs/)
* [json2.js](https://github.com/douglascrockford/JSON-js)
* [JSON Template](http://json-template.googlecode.com/svn/trunk/doc/Introducing-JSON-Template.html)