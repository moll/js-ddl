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

  describe("given a simple table", function() {
    require("./_database_test").mustPassSimpleTable(query, define)
  })

  describe("type", function() {
    _({
      BIGINT: Number,
      BIGSERIAL: Number,
      BOOLEAN: Boolean,
      "CHARACTER VARYING": String,
      CHARACTER: String,
      DATE: Date,
      "DOUBLE PRECISION": Number,
      INTEGER: Number,
      NUMERIC: Number,
      REAL: Number,
      SMALLINT: Number,
      SMALLSERIAL: Number,
      SERIAL: Number,
      TEXT: String,
      TIME: Date,
      "TIME WITHOUT TIME ZONE": Date,
      TIMESTAMP: Date,
      "TIMESTAMP WITHOUT TIME ZONE": Date
    }).each(function(klass, type) {
      it("must be set to " + klass.name + " given " + type, function*() {
        yield query('CREATE TABLE "test" ("foo" ' + type + ')')
        ;(yield define("test")).foo.type.must.equal(klass)
      })
    })

    it("must be set properly given differently cased type", function*() {
      yield query('CREATE TABLE "test" ("foo" Date)')
      ;(yield define("test")).foo.type.must.equal(Date)
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
