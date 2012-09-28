/*
** microdata.reveal.js
**
** Author: Jason Darwin
**
** Date: 27 September 2012
**
** A script to allow dectection and presentation to the user of the microdata
** embedded in a given page.
**
** Intended as part of a chrome extension, but can be run in non-chrome browsers
** by including the following in the <head>:
**
**  <script src="microdata.reveal/lib/jquery-1.6.4.min.js"></script>
**  <script src="microdata.reveal/lib/json2.js"></script>
**  <script src="microdata.reveal/lib/microdatajs/jquery.microdata.js"></script>
**  <script src="microdata.reveal/lib/microdatajs/jquery.microdata.json.js"></script>
**  <script src="microdata.reveal/lib/json-template.js"></script>
**  <script src="microdata.reveal/lib/messi/messi.min.js"></script>
**  <link rel="stylesheet" href="microdata.reveal/microdata.reveal.css" />
**  <script src="microdata.reveal/microdata.reveal.js"></script>
**
*/

var $ = jQuery;
var items = 0;
var jsonText;

$(window).load(function() {

  items = $('[itemscope]').not($('[itemscope] [itemscope]'));

  try {

    // Add the listener for messages from the chrome extension.
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.property == "items.length"){
        chrome.extension.sendMessage(null, {property: 'items.length', value: items.length}, function(response) {
        });
      }
      else if (request.property == "items.html") {
      }
      else if (request.property == "items.json") {
        jsonText = $.microdata.json(items, function(o) { return JSON.stringify(o, undefined, 2); });
        chrome.extension.sendMessage(null, {property: 'items.json', value: jsonText}, function(response) {
        });
      } else{
        sendResponse({});    // Stop
      }
    });

    // Tell the chrome extension that we're ready to receive messages
    chrome.extension.sendMessage(null, {property: 'status', status: 'ready'}, function(response) {
//        alert('client sending: ready');
    });

  } catch (e) {

    // Not in a chrome extension?
    // No problem, we'll inject a button at the top of the body.
    $('body').prepend(" \
    <div id='metadata_viewer' class='alignleft'> \
      <p><a id='view_metadata' href='#'>Loading...</a></p> \
      <div id='metadata_view' /> \
    </div> \
    ");

    if (items.length === 0) {
      $('#view_metadata').addClass('no_metadata_reveal');
      $('#view_metadata').text('No Microdata');
    } else {
      $('#view_metadata').addClass('metadata_reveal');
      $('#view_metadata').text('View Microdata');
    }

    $("a#view_metadata").click(function() {
      $('#metadata_view').append("<div id='metadata' />");
      // Get all top-level itemscopes (i.e. those without an ancestor itemscope)
      var items = $('[itemscope]').not($('[itemscope] [itemscope]'));
      jsonText = $.microdata.json(items, function(o) { return JSON.stringify(o, undefined, 2); });
      load_microdata(items);

      // Present the results using the Messi popup.
      new Messi($('#metadata'), {title: 'Microdata'});
      $('.messi-titlebox').append('<span class="metadata_source_view"><a id="view_metadata_source_html" style="display:none;" href="#">(HTML)</a><a id="view_metadata_source_json" href="#">(JSON)</a></span>');
   
      $("a#view_metadata_source_json").click(function(){
        $('#metadata_view').append("<div id='metadata' />");
        $('.messi-content').empty().append('<pre><code>' + jsonText + '</code></pre>');
        $('.metadata_source_view #view_metadata_source_html').toggle();
        $('.metadata_source_view #view_metadata_source_json').toggle();
        return false;
      });

      $("a#view_metadata_source_html").click(function(){
        $('#metadata_view').append("<div id='metadata' />");
        load_microdata(items);
        $('.messi-content').empty().append($('#metadata'));
        $('.metadata_source_view #view_metadata_source_html').toggle();
        $('.metadata_source_view #view_metadata_source_json').toggle();
        return false;
      });

    });

    function load_microdata(items) {
      if (items.length === 0) {
        $('#view_metadata').text = "No Microdata";
        $('#metadata_view').append("<div id='metadata' />");
        $('#metadata').append('<i>No microdata items found.</i>');
      } else {
        items.each( function() {
          var template = "\
          {# This is a comment and will be removed from the output.} \
          {.section items} \
            {.repeated section @} \
              <table class='metadata'> \
                <tbody> \
                  <tr class='major'><td>ITEM {number}</td><td></td></tr> \
                  <tr class='major'> \
                    <td>type:</td> \
                    <td><a href='{type}'>{type}</a></td> \
                  </tr> \
                  <tr class='major'> \
                    <td>property:</td><td></td> \
                  </tr> \
                {.section properties} \
                  {@|pairs} \
                {.end} \
                </tbody> \
              </table> \
            {.end} \
          {.or} \
            <p><em>(No page content matches)</em></p> \
          {.end} \
          ";

          var t = jsontemplate.Template(template, {more_formatters: more_formatters, undefined_str: ""});
          var item_number = 0;

          function more_formatters(formatter_name) {
            if (formatter_name === 'pairs') {
              return rowize_pairs;
            } else {
              return null;
            }
          }

          function rowize_pairs(value) {
            var str = '';
            var tables = [];
            $.each(value, function(key, val){
              if (String(val).indexOf('[object Object]') === 0) {
                tables.push(t.expand({ items: val, number: ++item_number}));
                str += '<tr><td>' + key + ':</td><td><i>ITEM ' + tables.length + '</i></td></tr>';
              }
              else {
                str += '<tr><td>' + key + ':</td><td>' + val + '</td></tr>';
              }
            });
            str += tables.join('');
            return str;
          }

          var s = t.expand($.parseJSON(jsonText));
          $('#metadata').append(s);
        } );
      }
    }
  }

});