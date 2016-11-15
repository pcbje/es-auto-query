'use strict'
var autoquery = (function() {
  var Clause = function() {
    var rangeValues = {
      '>': 'gt',
      '<': 'lt',
      '>=': 'gte',
      '<=': 'lte'
    }

    var rsplit = function(string, sep) {
      var split = string.split(sep);
      return [split.slice(0, -1).join(sep)].concat(split.slice(-1));
    }

    var getNestedObject = function(clause) {
      var path = rsplit(clause, '.');
      var obj = {
        nested: {
          path: path[0],
          query: {}
        }
      };

      return [obj, obj.nested.query];
    }

    var getClauseObject = function(clause) {
      var nested = clause.indexOf('.') >= 0;
      if (nested) {
        return getNestedObject(clause)
      }

      var obj = {};

      return [obj, obj]
    };

    return {
      equal: function(clause, value) {
        var queryType = value.indexOf('*') < 0 ? 'match' : 'wildcard';

        if (value.indexOf(' ') >= 0) {
          queryType = 'match_phrase';
        }

        var parts = getClauseObject(clause);
        var body = parts[0];
        var query = parts[1];

        query[queryType] = {};
        query[queryType][clause] = value;

        return body;
      },
      range: function(clause, value, op) {
        var rangeKey = rangeValues[op];

        var parts = getClauseObject(clause);
        var body = parts[0];
        var query = parts[1];

        query.range = {};
        query.range[clause] = {};
        query.range[clause][rangeKey] = isNaN(value * 1) ? value : value * 1;

        return body;
      }
    }
  }

  var Query = function(default_field) {
    var operatorParsers = {
      ':': 'equal',
      '>': 'range',
      '<': 'range',
      '>=': 'range',
      '<=': 'range'
    }

    var parseClause = function(clause_string) {
      if (clause_string.length === 0) {
        return {
          match_all: {}
        }
      }
      var operators = Object.keys(operatorParsers);

      operators.sort(function(a, b) {
        return b.length - a.length;
      })

      var clause = new Clause();

      var ops = clause_string.match(new RegExp(operators.join('|'), 'g'));

      if (ops === null) {
        return clause['equal'](default_field, clause_string);
      }

      if (ops.length > 1) {
        throw "Clause may only contain a single operator";
      }

      var op = ops[0];

      var parts = clause_string.split(op);
      var field_name = parts[0].trim();
      var value = parts[1].trim();

      return clause[operatorParsers[op]](field_name, value, op)
    };

    var clauses = {
        bool: {
          must: []
        }
    };

    return {
      addClause: function(clause) {
        clauses.bool.must.push(parseClause(clause));
      },
      asJson: function() {
        return JSON.parse(JSON.stringify(clauses))
      }
    }
  };

  var Autoquery = function() {
    return {
      generate: function(string, default_field) {
        if (!default_field) default_field = '_all';

        var query = new Query(default_field);

        var clauses = string.trim().split(' AND ');

        clauses.map(function(clause) {
          query.addClause(clause.trim());
        });

        return query.asJson();
      }
    }
  };

  return new Autoquery();
})();
