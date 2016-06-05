function (doc) {
  var index = 1;
  var pattern = /\{\{ [\w\d]* \}\}/g;
  var matches = pattern.exec(doc.data);
  while(matches) {
    var transDocId = matches[0].replace(/\{*\}*/g, '').trim();
    emit([doc._id, index], { _id: transDocId });
    matches = pattern.exec(doc.data);
    ++index;
  }
  emit([doc._id, 0], { data: doc.data });
}