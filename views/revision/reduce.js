/**
 * NOTE:
 * Built-in reduce functions should be preferred over writing a custom one.
 * Replace the contents of the file with one of these strings:
 *   _sum
 *   _count
 *   _stats
 **/

/**
 * Reduce function
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#reduce-and-rereduce-functions
 *
 * @param {(array|null)} keys – Array of pairs docid-key for related map function
 * result. Always null if rereduce is running (has true value).
 * @param {array} values – Array of map function result values.
 * @param {boolean} rereduce – Boolean sign of rereduce run.
 *
 * @returns {object} Reduced values
 **/
function(keys, values, rereduce) {
  if(rereduce) {
    return values;
  }

  var TYPES = { insert: 'I', update: 'U', delete: 'D' };

  var ref = values[0];
  var versions = [{ version: ref.version, data: ref.data }]; // Push the version 0 (original document)
  for(var i = 1; i < values.length; i++) {
    ref = versions[i - 1]; // get the last version has a reference for the new version
    var doc = values[i];
    var revData;
    for(var revId in doc.revisions) {
      var rev = doc.revisions[revId];
      if(typeof revData == 'undefined') revData = ref.data;
      var rFrom = rev.from;
      var rTo = rev.to;
      switch(rev.type) {
        case TYPES.insert:
        revData = revData.slice(0, rFrom) + rev.data + revData.slice(rFrom);
        break;
        case TYPES.update:
        revData = revData.slice(0, rFrom) + rev.data + revData.slice(rTo);
        break;
        case TYPES.delete:
        revData = revData.slice(0, rFrom) + revData.slice(rTo);
        break;
      }
    }
    versions.push({ version: doc.version, data: revData });
    delete(revData); // unset the revision data to process a new version
  }
  return versions;
}
