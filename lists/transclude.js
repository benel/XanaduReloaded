/**
 * List function - use `start()` and `send()` to output headers and content.
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#listfun
 *
 * @param {object} head - View Head Information. http://docs.couchdb.org/en/latest/json-structure.html#view-head-info-object
 * @param {object} req - Request Object. http://docs.couchdb.org/en/latest/json-structure.html#request-object
 **/
function(head, req) {
  var getTransclusions = function(doc, transDoc) {
    var data = doc.data;
    data = data.replace(getTransdeliveryRgx(transDoc), '[' + transDoc.data + '](' + transDoc._id + ')'); // Transdelivery
    data = data.replace(getTransquoteRgx(transDoc), '[' + transDoc.data + ']' + '(<' + transDoc._id + '>)'); // Transquote
    doc.data = data;
    return doc;
  }
  var getTransdeliveryRgx = function(transDoc) {
    return new RegExp('\{\{ ' + transDoc._id + ' \}\}', 'g');
  }
  var getTransquoteRgx = function(transDoc) {
    return new RegExp('\{\{ =' + transDoc._id + ' \}\}', 'g');
  }
  var hasTransclusion = function(doc) {
    return /\{\{ =?[\w\d]* \}\}/g.test(doc.data);
  }
  provides('json', function() {
    var json = [];
    var docs = {}; // store all the docs
    var row, doc;
    while(row = getRow()) {
      // Get document which transcludes other documents
      if(row.key[1] === 0) {
        if(doc) json.push(doc);
        doc = row.doc;
        continue;
      }
      // Get transcluded documents data in order to transclude them in the "parent" document
      var transDoc = row.doc;

      doc = getTransclusions(doc, transDoc);

      docs[doc._id] = doc;
      docs[transDoc._id] = transDoc;
    }

    // Push last document when the loop is finished
    json.push(doc);

    // Check if everything has been transcluded, if not, go through whole the docuverse to finish the transclusion
    // Can be optimized by only looking into the needed documents instead of searching in the docuverse
    // Also, a transcluding loop (A transcludes B and B transludes A) would lead to a crash
    for(var nDoc in docs) {
      while(hasTransclusion(docs[nDoc])) {
        for(var transDoc in docs) {
          json[json.indexOf(docs[nDoc])] = getTransclusions(doc, docs[transDoc]);
        }
        docs[nDoc] = json[json.indexOf(docs[nDoc])];
      }
    }

    send(JSON.stringify(json));
  });
}
