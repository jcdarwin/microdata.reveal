// React when a browser action's icon is clicked.
var icon_active   = 'icon_active48.png';
var icon_inactive = 'icon_inactive48.png';
var $ = jQuery;

chrome.browserAction.onClicked.addListener(function(tab) {

  chrome.extension.sendMessage({property: 'items.length'}, function(response) {
      alert('server sending');
  });

  var items_length = 0;
  chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.property == "items.length"){
      alert('server receiving');
      items_length = request.items_length;
    }
    else{
      sendResponse({});    // Stop
    }
  });

  if (items_length === 0) {
    chrome.browserAction.setIcon({path: icon_inactive});
    alert('inactive');
  } else {
    chrome.browserAction.setIcon({path: icon_active});
    alert('active: ' + items_length);
  }

});
