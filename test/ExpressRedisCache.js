import ERC from "../dist";

let cache;
let prefix = process.env.EX_RE_CA_PREFIX || "erct:";
let host = process.env.EX_RE_CA_HOST || "localhost";
let port = process.env.EX_RE_CA_PORT || 6379;

describe("Module", () => {
  it("should be a function", () => {
    ERC.should.be.a.function;
  });

  it("should return a new ExpressRedisCache", done => {
    cache = new ERC({ prefix: prefix, host: host, port: port });
    cache.constructor.name.should.equal("ExpressRedisCache");
    cache.on("error", error => {
      throw error;
    });
    cache.on("connected", () => {
      done();
    });
  });

  it("should have a property options which is an object", () => {
    cache.should.have.property("options").which.is.an.Object();
  });

  it("should have a property prefix which is a string and equals request prefix", () => {
    cache.should.have.property("prefix").which.is.a.String();
    cache.prefix.should.equal(prefix);
  });

  it("should have a property host which is a string and equals request host", () => {
    cache.should.have.property("host").which.is.a.String();
    cache.host.should.equal(host);
  });

  it("should have a property port which is a number and equals request port", () => {
    cache.should.have.property("port").which.is.a.Number();
    cache.port.should.equal(port);
  });

  it("should have a property FOREVER which is a number and equals -1", () => {
    cache.should.have.property("FOREVER").which.is.a.Number();
    cache.FOREVER.should.equal(-1);
  });

  it("should have a property connected which is a boolean and is true", () => {
    cache.should.have.property("connected").which.is.a.Boolean();
    cache.connected.should.be.true;
  });

  it("should have a property expire which is a number and equals FOREVER", () => {
    cache.should.have.property("expire").which.is.a.Number();
    cache.expire.should.equal(cache.FOREVER);
  });

  it("should have a property client which is a RedisClient", () => {
    cache.should.have.property("client").which.is.an.Object();
    cache.client.constructor.name.should.equal("RedisClient");
  });
});
