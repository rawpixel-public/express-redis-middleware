import request from "request";
import child_process from "child_process";

let spawn, express_port;

describe("test with small express server", () => {
  before(function(done) {
    this.timeout(5000);
    spawn = child_process.spawn("express/server.js", [], {});

    spawn.on("error", error => {
      console.error(error);
    });

    spawn.on("exit", status => {
      console.log(`Express Server exit with status ${status}`);
    });

    spawn.stdout.on("data", data => {
      console.log(data.toString());
      if (
        /express-redis-cache test server started on port/.test(data.toString())
      ) {
        express_port = data
          .toString()
          .split(" ")
          .pop()
          .trim();
        done();
      }
    });

    spawn.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
    });
  });

  it("should have a / route", done => {
    request(`http://localhost:${express_port}`, (error, response) => {
      if (error) {
        throw error;
      }
      response.statusCode.should.equal(200);
      done();
    });
  });

  it("should not have /foobar route", done => {
    request(`http://localhost:${express_port}/foobar`, (error, response) => {
      if (error) {
        throw error;
      }
      response.statusCode.should.equal(404);
      done();
    });
  });

  it("/1sec route should return json with a timestamp property", done => {
    let url = `http://localhost:${express_port}/1sec`;
    request(url, (error, response, body) => {
      if (error) {
        throw error;
      }
      let p_body = JSON.parse(body);
      // Some Mocha weirdness requires a try/catch
      // or an AssertionError will crash the mocha process on error
      try {
        response.statusCode.should.equal(200);
        p_body.should.have.property("timestamp");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it("/default_expire route should return json with a timestamp property", done => {
    let url = `http://localhost:${express_port}/default_expire`;
    request(url, (error, response, body) => {
      if (error) {
        throw error;
      }
      let p_body = JSON.parse(body);
      // Some Mocha weirdness requires a try/catch
      // or an AssertionError will crash the mocha process on error
      try {
        response.statusCode.should.equal(200);
        p_body.should.have.property("timestamp");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it("/never_expire route should return json with a timestamp property", done => {
    let url = `http://localhost:${express_port}/never_expire`;
    request(url, (error, response, body) => {
      if (error) {
        throw error;
      }
      let p_body = JSON.parse(body);
      // Some Mocha weirdness requires a try/catch
      // or an AssertionError will crash the mocha process on error
      try {
        response.statusCode.should.equal(200);
        p_body.should.have.property("timestamp");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it("/1sec route data should expire after 1 seconds", done => {
    setTimeout(() => {
      let url = `http://localhost:${express_port}/1sec`;
      request(url, (error, response, body) => {
        if (error) {
          throw error;
        }
        let p_body = JSON.parse(body),
          timestamp = p_body.timestamp,
          now_timestamp = Math.floor(Date.now() / 1000);

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          timestamp.should.be.above(now_timestamp - 1);
          done();
        } catch (e) {
          done(e);
        }
      });
    }, 1100);
  });

  it("/default_expire route data should expire after 3 seconds", function(done) {
    this.timeout(4000); // allow 5 secs to execute
    setTimeout(() => {
      let url = `http://localhost:${express_port}/default_expire`;
      request(url, (error, response, body) => {
        if (error) {
          throw error;
        }
        let p_body = JSON.parse(body),
          timestamp = p_body.timestamp,
          now_timestamp = Math.floor(Date.now() / 1000);

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          timestamp.should.be.above(now_timestamp - 3);
          done();
        } catch (e) {
          done(e);
        }
      });
    }, 3100);
  });

  it("/never_expire route data should not expire after 3 seconds", function(done) {
    this.timeout(4000); // allow 5 secs to execute
    setTimeout(() => {
      let url = `http://localhost:${express_port}/never_expire`;
      request(url, (error, response, body) => {
        if (error) {
          throw error;
        }
        let p_body = JSON.parse(body),
          timestamp = p_body.timestamp,
          now_timestamp = Math.floor(Date.now() / 1000);

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          timestamp.should.be.below(now_timestamp - 3);
          done();
        } catch (e) {
          done(e);
        }
      });
    }, 3100);
  });

  it("/never_expire/delete route data should be deleted", done => {
    let url = `http://localhost:${express_port}/delete_never_expire`;
    request(url, (error, response, body) => {
      if (error) {
        throw error;
      }
      // Some Mocha weirdness requires a try/catch
      // or an AssertionError will crash the mocha process on error
      try {
        response.statusCode.should.equal(200);
        body.should.equal("count:1");
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  after(done => {
    process.kill(spawn.pid);
    done();
  });
});
