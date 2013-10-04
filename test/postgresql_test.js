var _ = require("underscore")
var Pg = require("pg").native

Pg.defaults.host = "/tmp"
Pg.defaults.database = "assertions_test"

var db = new Pg.Client
before(function(done) { db.connect(done) })
after(db.end.bind(db))

var Shared = require("./shared")
var attributes = require("..").postgresql

describe("PostgreSQL", function() {
  beforeEach(function(done) { db.query("BEGIN", done) })
  afterEach(function(done) { db.query("ROLLBACK", done) })

  describe("given a simple table", function() {
    Shared.mustPassSimpleTable(withSql)
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
      describe("given " + type, function() {
        withSql('CREATE TABLE "test" ("foo" ' + type + ')')

        it("must be set to " + klass.name, function() {
          this.attrs.foo.type.must.equal(klass)
        })
      })
    })

    describe("given differently cased type", function() {
      withSql('CREATE TABLE "test" ("foo" Date)')

      it("must be set properly", function() {
        this.attrs.foo.type.must.equal(Date)
      })
    })
  })

  describe("default", function() {
    Shared.mustPassDefault(withSql)

    describe("given autoincrement", function() {
      withSql('CREATE TABLE "test" ("foo" SERIAL)')

      it("must be set to undefined", function() {
        this.attrs.foo.must.have.property("default", undefined)
      })
    })

    describe("of TEXT column", function() {
      Shared.mustPassTextDefault(withSql)

      describe("given 'unknown'::character varying", function() {
        withSql('CREATE TABLE "test" ' +
          '("foo" CHARACTER VARYING(255) ' +
          'DEFAULT \'unknown\'::character varying' + 
          ')')

        it("must be set to \"unknown\"", function() {
          this.attrs.foo.must.have.property("default", "unknown")
        })
      })
    })

    describe("of REAL column", function() {
      Shared.mustPassRealDefault(withSql)
    })

    describe("of BOOLEAN column", function() {
      Shared.mustPassBooleanDefault(withSql)

      describe("given 1::boolean", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 1::boolean)')

        it("must be set to true", function() {
          this.attrs.foo.must.have.property("default", true)
        })
      })

      describe("given 't'::boolean", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'t\'::boolean)')

        it("must be set to true", function() {
          this.attrs.foo.must.have.property("default", true)
        })
      })

      describe("given 0::boolean", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 0::boolean)')

        it("must be set to false", function() {
          this.attrs.foo.must.have.property("default", false)
        })
      })

      describe("given 'f'::boolean", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'f\'::boolean)')

        it("must be set to false", function() {
          this.attrs.foo.must.have.property("default", false)
        })
      })

      describe("given 42::boolean", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 42::boolean)')

        it("must be set to undefined", function() {
          this.attrs.foo.must.have.property("default", undefined)
        })
      })
    })

    describe("of INTERVAL column", function() {
      describe("given '00:00:00'::interval", function() {
        withSql(
          'CREATE TABLE "test" ("foo" INTERVAL DEFAULT \'00:00:00\'::interval)'
        )

        it("must be set to \"00:00:00\"", function() {
          this.attrs.foo.must.have.property("default", "00:00:00")
        })
      })
    })
  })

  function withSql(sql, fn) {
    beforeEach(function(done) { db.query(sql, done) })
    beforeEach(withAttrs(function(attrs) { this.attrs = attrs }))
  }

  function withAttrs(fn) {
    return function(done) {
      var self = this
      attributes(db, "test", function(err, attrs) {
        if (err) return done(err)
        fn.call(self, attrs)
        done()
      })
    }
  }
})
