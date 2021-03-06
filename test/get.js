import should from "should";
import ERC from "../dist";

let prefix = process.env.EX_RE_CA_PREFIX || "erct:";
let host = process.env.EX_RE_CA_HOST || "localhost";
let port = process.env.EX_RE_CA_PORT || 6379;

let cache = new ERC({
  prefix: prefix,
  host: host,
  port: port
});

describe("get", () => {
  let error, results;

  it("should be a function", () => {
    cache.get.should.be.a.Function;
  });

  it("should callback", done => {
    cache.get(null, ($error, $results) => {
      error = $error;
      results = $results;
      done();
    });
  });

  it("should not have error", () => {
    should(error).be.null;
  });

  it("should be an array", () => {
    results.should.be.an.Array;
  });

  it(" - entry which has a property name which a string", () => {
    results.forEach(result => {
      result.name.should.be.a.String;
    });
  });

  it(" - entry which has a property body which a string", () => {
    results.forEach(result => {
      result.body.should.be.a.String;
    });
  });

  it(" - entry which has a property type which a string", () => {
    results.forEach(result => {
      result.type.should.be.a.String;
    });
  });

  it(" - entry which has a property touched which is a number which resolves to date", () => {
    results.forEach(result => {
      Number(result.touched).should.be.a.Number;

      new Date(Number(result.touched)).should.be.a.Date;
    });
  });

  it("should support wildcard gets", done => {
    cache.add("wildkey1", "abc", ($error, $name, $entry) => {
      cache.add("wildkey2", "def", ($error, $name, $entry) => {
        cache.get("wildkey*", ($error, $results) => {
          $results.should.be.an.Array;
          $results.should.have.a.lengthOf(2);
          done();
        });
      });
    });
  });

  it("should support specific gets without calling keys", done => {
    // wrap the call to keys, so we can see if it's called
    let callCount = 0;
    let wrap = function(fn) {
      return function() {
        console.log("What!?");
        callCount++;
        return fn.apply(this, arguments);
      };
    };

    cache.client.keys = wrap(cache.client.keys);

    cache.add("wildkey1", "abc", ($error, $name, $entry) => {
      cache.add("wildkey2", "def", ($error, $name, $entry) => {
        cache.get("wildkey1", ($error, $results) => {
          try {
            $results.should.be.an.Array;
            $results.should.have.a.lengthOf(1);
            callCount.should.equal(0);
            done();
          } catch (e) {
            done(e);
          }
        });
      });
    });
  });
});
