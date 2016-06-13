/**
 * List function - use `start()` and `send()` to output headers and content.
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#listfun
 *
 * @param {object} head - View Head Information. http://docs.couchdb.org/en/latest/json-structure.html#view-head-info-object
 * @param {object} req - Request Object. http://docs.couchdb.org/en/latest/json-structure.html#request-object
 **/
function(head, req) {
  var getTransclusions = function(doc, transDoc, rgx1, rgx2) {
    var data = doc.data;
    doc.data = data.replace(rgx1, '[' + transDoc.data + ']()'); // Transdelivery
    doc.data = data.replace(rgx2, '[' + transDoc.data + ']' + '(' + transDoc._id + ')'); // Transquote
    return doc;
  }
  var getTransdeliveryRgx = function(transDoc) {
    return new RegExp('{{ ' + transDoc._id + ' }}', 'g');
  }
  var getTransquoteRgx = function(transDoc) {
    return new RegExp('{{ =?' + transDoc._id + ' }}', 'g');
  }
  var findDoc = function(doc) {

  }
  provides('json', function() {
    var json = [];
    var pushLaterList = [];
    var docs = [];
    var row, doc;
    var transcludeRgx = /\{\{ =?[\w\d]* \}\}/g;
    while(row = getRow()) {
      // Get document which transcludes other documents
      if(row.key[1] === 0) {
        if(doc) json.push(doc);
        doc = row.doc;
        continue;
      }
      // Get transcluded documents data in order to transclude them in the "parent" document
      var transDoc = row.doc;

      if(transcludeRgx.test(transDoc.data)) {
        pushLaterList[doc._id] = {};
        if(!pushLaterList[doc._id].transcludes) pushLaterList[doc._id].transcludes = [];
        pushLaterList[doc._id].transcludes[transDoc._id] = transDoc;
        pushLaterList[doc._id].doc = doc;
      } else {
        doc = getTransclusions(doc, transDoc, getTransdeliveryRgx(transDoc), getTransquoteRgx(transDoc));
        docs[doc._id] = doc;
      }
    }
    // Push last document
    json.push(doc);

    for(var laterDocId in pushLaterList) {
      var laterTransDocs = pushLaterList[laterDocId].transcludes;
      var laterDoc = pushLaterList[laterDocId].doc;
      for(var transDocId in laterTransDocs) { // recursive transclusion
        var laterTransDoc = laterTransDocs[transDocId];
        laterDoc = getTransclusions(json[json.indexOf(laterDoc)], docs[laterTransDoc._id], getTransdeliveryRgx(laterTransDoc), getTransquoteRgx(laterTransDoc));
        json[json.indexOf(laterDoc)] = laterDoc;

        docs[doc._id] = laterDoc;
      }
    }

    send(JSON.stringify(json));
  });
}
