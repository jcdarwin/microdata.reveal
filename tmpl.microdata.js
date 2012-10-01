/*
** tmpl.microdata.js
**
** Author: Jason Darwin
**
** Date: 27 September 2012
**
*/

if (!this.tmpl) {
  tmpl = function() {
    var microdata = {
      template: "\
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
                  <td>properties:</td><td></td> \
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
        ",
      load: function (items, json_text) {
        var expanded;
        if (items.length === 0) {
          $('#view_metadata').text = "No Microdata";
          $('#metadata_view').append("<div id='metadata' />");
          $('#metadata').append('<i>No microdata items found.</i>');
        } else {
          items.each( function() {

            var t = jsontemplate.Template(tmpl.microdata.template, {more_formatters: more_formatters, undefined_str: ""});
            var item_number = 0;

            function more_formatters(formatter_name) {
              if (formatter_name === 'pairs') {
                return rowize_pairs;
              } else {
                return null;
              }
            }

            function rowize_pairs(value) {
              String.prototype.trunc =
                function(n){
                    return this.substr(0,n-1)+(this.length>n?'&hellip;':'');
                };
              var str = '';
              var tables = [];
              $.each(value, function(key, val){
                if (String(val).indexOf('[object Object]') === 0) {
                  tables.push(t.expand({ items: val, number: ++item_number}));
                  str += '<tr><td>' + key + ':</td><td><i>ITEM ' + tables.length + '</i></td></tr>';
                }
                else {
                  if ( String(val).match(/^http(s)?:\/\//) ) {
                    if ( String(val).match(/\.(jpg|png|gif)$/) ) {
                      val = '<a href="' + val + '" title="' + val + '"><img src="' + val + '" style="max-width:200px;" /></a>';
                    } else {
                      val = '<a href="' + val + '" title="' + val + '">' + String(val).trunc(60) + '</a>';
                    }
                  }
                  str += '<tr><td>' + key + ':</td><td>' + val + '</td></tr>';
                }
              });
              str += tables.join('');
              return str;
            }

            expanded = t.expand($.parseJSON(json_text));
          } );
        }
        return expanded;
      }
    };

    return {
      microdata: microdata
    };

  }();
}