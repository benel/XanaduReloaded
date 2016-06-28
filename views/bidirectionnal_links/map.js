function(doc) {
  if(doc.links) {
    doc.links.forEach(function(link) {
      emit([link.from, 1], { _id: link.to, type: link.type, source: "from" });
      emit([link.to, 1], { _id: link.from, type: link.type, source: "to" });
    });
  }
  emit([doc._id, 0], doc.data);
}