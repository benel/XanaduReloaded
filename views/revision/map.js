/**
 * Map function - use `emit(key, value)1 to generate rows in the output result.
 * @link http://docs.couchdb.org/en/latest/couchapp/ddocs.html#reduce-and-rereduce-functions
 *
 * @param {object} doc - Document Object.
 */
function(doc) {
    var docInfo = doc._id.split('/');
    var docId = docInfo[0];
    var docV = (typeof docInfo[1] !== 'undefined') ? docInfo[1] : 0;
    emit(docId, { version: docV, data: doc.data, revisions: doc.revisions });
}
