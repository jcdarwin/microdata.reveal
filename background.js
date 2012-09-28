// Messaging flow:
// client sends {property: 'status', status: 'ready'} to server
// server sends {property: 'items.length'} to client
// client sends {property: 'items.length', value: int} to server

// React when a browser action's icon is clicked.
var icon_active   = 'icon48.png';
var icon_inactive = 'icon_inactive48.png';
var jsonText;
var items;
var s;
var $ = jQuery;

$(document).ready(function() {
  chrome.tabs.getSelected(null, function(tab) {
    // Request the microdata items in JSON format from the client tab.
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

    load_microdata(items, request.value);
    $('#metadata').append(s);

    // Present the results using the Messi popup.
    new Messi($('#metadata'), {title: 'Microdata'});
    // Ensure our the button on the messi dialogue close the popup.
    $('.messi-closebtn').click(function(){
      window.close();
    });
    $('.messi-titlebox').append('<span class="metadata_source_view"><a id="view_metadata_source_html" style="display:none;" href="#">(HTML)</a><a id="view_metadata_source_json" href="#">(JSON)</a></span>');

    $("a#view_metadata_source_json").click(function(){
      $('#metadata_view').append("<div id='metadata' />");
      $('.messi-content').empty().append('<pre><code>' + request.value + '</code></pre>');
      $('.metadata_source_view #view_metadata_source_html').toggle();
      $('.metadata_source_view #view_metadata_source_json').toggle();
      return false;
    });

    $("a#view_metadata_source_html").click(function(){
      $('.messi-content').empty().append($('#metadata'));
      $('#metadata').append(s);
      $('.metadata_source_view #view_metadata_source_html').toggle();
      $('.metadata_source_view #view_metadata_source_json').toggle();
      return false;
    });

  }
  else{
    sendResponse({});    // Stop
  }

  function load_microdata(items, json_text) {
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
          <p><em>No microdata items found.</em></p> \
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

        s = t.expand($.parseJSON(json_text));
      } );
    }
  }
});