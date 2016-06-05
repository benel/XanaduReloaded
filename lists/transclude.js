/**
 * List function - use `start()` and `send()` to output headers and content.
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#listfun
 *
 * @param {object} head - View Head Information. http://docs.couchdb.org/en/latest/json-structure.html#view-head-info-object
 * @param {object} req - Request Object. http://docs.couchdb.org/en/latest/json-structure.html#request-object
 **/
function(head, req) {
  provides('json', function() {
    var data = [];
    var json = [];
    var row, doc;
    while(row = getRow()) {
      if(row.key[1] === 0) {
        if(doc && data[doc._id]) json.push({ '_id': doc._id, 'data': data[doc._id] });
        doc = row.doc;
        data[doc._id] = doc.data;
        continue;
      }
      var transDoc = row.doc;
      var transPattern = new RegExp('{{ ' + transDoc._id + ' }}', 'g');
      data[doc._id] = data[doc._id].replace(transPattern, transDoc.data);
    }
    send(JSON.stringify(json));
  });
}
