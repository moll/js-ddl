var _ = require("underscore")
var Pg = require("pg")
var denodeify = require("denodeify")

var db = new Pg.Client("postgresql://localhost/ddl_test")
before(db.connect.bind(db))
after(db.end.bind(db))

var query = denodeify(db.query.bind(db))
var define = denodeify(require("../..").postgresql.bind(null, db))

describe("Ddl.postgresql", function() {
  beforeEach(function*() { yield query("BEGIN") })
  afterEach(function*() { yield query("ROLLBACK") })

  require("./_database_test").mustPassSimpleTable(query, define)

  describe("type", function() {
    var TYPES = {
      BIGINT: "number",
      BIGSERIAL: "number",
      BOOLEAN: "boolean",
      "CHARACTER VARYING": "string",
      CHARACTER: "string",
      DATE: "string",
      "DOUBLE PRECISION": "number",
      INTEGER: "number",
      NUMERIC: "number",
      REAL: "number",
      SMALLINT: "number",
      SMALLSERIAL: "number",
      SERIAL: "number",
      TEXT: "string",
      TIME: "string",
      "TIME WITHOUT TIME ZONE": "string",
      TIMESTAMP: "string",
      "TIMESTAMP WITHOUT TIME ZONE": "string"
    }

    _(TYPES).each(function(type, sql) {
      it("must be set to " + type + " given " + sql, function*() {
        yield query('CREATE TABLE "test" ("foo" ' + sql + ' NOT NULL)')
        ;(yield define("test")).foo.type.must.equal(type)
      })
    })

    it("must be an array of number given INTEGER[]", function*() {
      yield query('CREATE TABLE "test" ("foo" INTEGER[] NOT NULL)')
      var ddl = yield define("test")
      ddl.foo.type.must.equal("array")
      ddl.foo.items.must.eql({type: "number"})
    })

    it("must be set properly given differently cased type", function*() {
      yield query('CREATE TABLE "test" ("foo" Date NOT NULL)')
      ;(yield define("test")).foo.type.must.equal("string")
    })

    it("must set type with null and items given a nullable array", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT[])')
      var ddl = yield define("test")
      ddl.foo.type.must.eql(["array", "null"])
      ddl.foo.items.must.eql({type: "string"})
    })

    it("must set items type with null given a non-nullable array", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT[] NOT NULL)')
      var ddl = yield define("test")
      ddl.foo.type.must.equal("array")
      ddl.foo.items.must.eql({type: "string"})
    })

    it("must set type given a two-dimension array", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT[][] NOT NULL)')
      var ddl = yield define("test")
      ddl.foo.type.must.equal("array")
      ddl.foo.items.must.eql({type: "array", items: {type: "string"}})
    })

    it("must set type given a three-dimension array", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT[][][] NOT NULL)')
      var ddl = yield define("test")
      ddl.foo.type.must.equal("array")
      ddl.foo.items.must.eql({
        type: "array",
        items: {type: "array", items: {type: "string"}}
      })
    })
  })

  describe("default", function() {
    require("./_database_test").mustPassDefault(query, define)

    it("must be set to undefined given autoincrement", function*() {
      yield query('CREATE TABLE "test" ("foo" SERIAL)')
      ;(yield define("test")).foo.must.have.property("default", undefined)
    })

    describe("of TEXT column", function() {
      require("./_database_test").mustPassTextDefault(query, define)

      it("must be set to \"unknown\" given 'unknown'::character varying",
        function*() {
        yield query('CREATE TABLE "test" ' +
                    '("foo" CHARACTER VARYING(255) ' +
                    'DEFAULT \'unknown\'::character varying' + 
                    ')')

        ;(yield define("test")).foo.must.have.property("default", "unknown")
      })
    })

    describe("of REAL column", function() {
      require("./_database_test").mustPassRealDefault(query, define)
    })

    describe("of BOOLEAN column", function() {
      require("./_database_test").mustPassBooleanDefault(query, define)

      it("must be set to true given 1::boolean", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 1::boolean)')
        ;(yield define("test")).foo.must.have.property("default", true)
      })

      it("must be set to true given 't'::boolean", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'t\'::boolean)')
        ;(yield define("test")).foo.must.have.property("default", true)
      })

      it("must be set to false given 0::boolean", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 0::boolean)')
        ;(yield define("test")).foo.must.have.property("default", false)
      })

      it("must be set to false given 'f'::boolean", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'f\'::boolean)')
        ;(yield define("test")).foo.must.have.property("default", false)
      })

      it("must be set to undefined given 42::boolean", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 42::boolean)')
        ;(yield define("test")).foo.must.have.property("default", undefined)
      })
    })

    describe("of INTERVAL column", function() {
      it("must be set to \"00:00:00\" given '00:00:00'::interval", function*() {
        yield query(
          'CREATE TABLE "test" ("foo" INTERVAL DEFAULT \'00:00:00\'::interval)'
        )

        ;(yield define("test")).foo.must.have.property("default", "00:00:00")
      })
    })
  })
})
