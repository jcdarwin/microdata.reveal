/*
** microdata.reveal (background.js)
**
** Author: Jason Darwin
**
** Date: 27 September 2012
**
** A script to allow dectection and presentation to the user of the microdata
** embedded in a given page.
**
** Messaging flow between client (foreground) tab and server (background):
** * client sends {property: 'status', status: 'ready'} to server
** * server sends {property: 'items.length'} to client
** * client sends {property: 'items.length', value: int} to server
** * server sends {property: 'items.json'} to client
** * client sends {property: 'items.json', value: string} to server
*/

// React when the browser action's icon is clicked.
var icon_active   = 'icon48.png';
var icon_inactive = 'icon_inactive48.png';
var jsonText;
var items;
var $ = jQuery;

$(document).ready(function() {
  chrome.tabs.getSelected(null, function(tab) {
    // Request the microdata items in JSON format from the client (foreground) tab.
    chrome.tabs.sendMessage(tab.id, {property: 'items.json'}, function(response) {
    });
  });
});

// Trap any link clicks and open them in the current tab.
$('a').live('click', function(e) {
  var href = e.currentTarget.href;
  chrome.tabs.getSelected(null,function(tab) {
    chrome.tabs.update(tab.id, {url: href});
  });
  window.close(); // To close the popup.
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.property == "status"){
    // Client tab is letting us know we can start messaging them.
    chrome.tabs.getSelected(null, function(tab) {
      // Request the number of microdata items from the client tab.
      chrome.tabs.sendMessage(tab.id, {property: 'items.length'}, function(response) {
      });
    });
  } else
  if (request.property == "items.length"){
    var items_length = request.value;
    if (items_length === 0) {
      chrome.browserAction.setIcon({path: icon_inactive});
    } else {
      chrome.browserAction.setIcon({path: icon_active});
    }
    chrome.tabs.getSelected(null, function(tab) {
      // Request the microdata items in JSON format from the client tab.
      chrome.tabs.sendMessage(tab.id, {property: 'items.json'}, function(response) {
      });
    });
  } else
  if (request.property == "items.json"){
    items = $($.parseJSON(request.value));
    $('body').prepend(" \
    <div id='metadata_viewer' class='alignleft'> \
      <div id='metadata_view' /> \
    </div> \
    ");

    $('#metadata_view').append("<div id='metadata' />");

    // Load up the template
    var expanded = tmpl.microdata.load(items, request.value);
    $('#metadata').append(expanded);

    // Present the results using the Messi popup.
    new Messi($('#metadata'), {title: 'Microdata'});

    // Ensure our the button on the Messi dialogue closes the popup.
    $('.messi-closebtn').click(function(){
      window.close();
    });

    $('.messi-titlebox').append('<span class="metadata_source_view"><a id="view_metadata_source_html" style="display:none;" href="#">(HTML)</a><a id="view_metadata_source_json" href="#">(JSON)</a></span>');

    // Click handler for the view JSON link
    $("a#view_metadata_source_json").click(function(){
      $('#metadata_view').append("<div id='metadata' />");
      $('.messi-content').empty().append('<pre><code>' + request.value + '</code></pre>');
      $('.metadata_source_view #view_metadata_source_html').toggle();
      $('.metadata_source_view #view_metadata_source_json').toggle();
      return false;
    });

    // Click handler for the view HTML link
    $("a#view_metadata_source_html").click(function(){
      $('.messi-content').empty().append($('#metadata'));
      $('#metadata').append(expanded);
      $('.metadata_source_view #view_metadata_source_html').toggle();
      $('.metadata_source_view #view_metadata_source_json').toggle();
      return false;
    });

  }
  else{
    sendResponse({});    // Stop
  }

});