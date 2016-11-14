es-auto-query
=============

A quick-and-dirty string to Elasticsearch query object, because writing this was easier than making sense of the nested query_string_query discussion. It probably has a bunch of errors and limitations, but it seems to work just fine for my needs.


#### Supported formats:
```
Match _all fields: "value"
Field specification: "field:value2"
Wildcards: "*value*"
Value greater than: "field > value"
Value greater or equal: "field >= value"
Value less or equal: "field <= value"
Value less than: "field < value"
Nested field: "some_object.field:value"
```

Clauses may be combined using " AND ".


#### Example:
```
client.search({
  index: 'files',
  type: 'file',
  body: {      
    from: 0,
    size: 10,
    query: autoquery.generate('file.size > 1024 AND file.name:*')      
  }
}).then(function(result) {
  console.log(result);
});
```
