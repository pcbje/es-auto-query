describe("autoquery", function() {

  it('generates match_all query if no clause', function() {
    expect(autoquery.generate('')).toEqual({
      bool : {
        must : [
          {match_all: {}}
        ]
      }
    });
  });

  it('uses supplied default field', function() {
    expect(autoquery.generate('test', 'mock')).toEqual({
      bool : {
        must : [
          { match : { mock : 'test' } }
        ]
      }
    });
  });

  it('falls back to _all id no default field supplied', function() {
    expect(autoquery.generate('test')).toEqual({
      bool : {
        must : [
          { match : { _all : 'test' } }
        ]
      }
    });
  });

  it('uses field name from query if : present', function() {
    expect(autoquery.generate('ext:txt')).toEqual({
      bool : {
        must : [
          { match : { ext : 'txt' } }
        ]
      }
    });
  });

  it('splits clauses by AND', function() {
    expect(autoquery.generate('test AND test')).toEqual({
      bool : {
        must : [
          { match : {_all : 'test' } },
          { match : { _all : 'test' } }
        ]
      }
    });
  });

  it('nests clause if "." in fieldname', function() {
    var actual = autoquery.generate('meta.size:0')

    expect(actual).toEqual({
      bool : {
        must : [
          {
            nested : {
              path : 'meta',
              query : {
                match : {
                  'meta.size' : '0'
                }
              }
            }
          }
        ]
      }
    });
  });

  it('generates wildcard query if * in value', function() {
    expect(autoquery.generate('test*')).toEqual({
      bool : {
        must : [
          { wildcard : { _all : 'test*' } }
        ]
      }
    });
  });

  it('generates gt range query if > operator', function() {
    expect(autoquery.generate('size>0')).toEqual({
      bool : {
        must : [
          { range : { size : { gt : 0 } } }
        ]
      }
    });
  });

  it('generates lt range query if < operator', function() {
    expect(autoquery.generate('size<100')).toEqual({
      bool : {
        must : [
          { range : { size : { lt : 100 } } }
        ]
      }
    });
  });

  it('generates gte range query if >= operator', function() {
    expect(autoquery.generate('name>=b')).toEqual({
      bool : {
        must : [
          { range : { name : { gte : 'b' } } }
        ]
      }
    });
  });

  it('generates lte range query if <= operator', function() {
    expect(autoquery.generate('name<=b')).toEqual({
      bool : {
        must : [
          { range : { name : { lte : 'b' } } }
        ]
      }
    });
  });

  it('raises exception if multiple operators in a single clause', function() {
    expect(function() {
      autoquery.generate('name<<b')
    }).toThrow(new Error("Clause may only contain a single operator"));
  });

  it('generates match_phrase query if value contains white space.', function() {
    expect(autoquery.generate('per hansen')).toEqual({
      bool : {
        must : [
          { match_phrase : { _all : 'per hansen' } }
        ]
      }
    });
  });
});
