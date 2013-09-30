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
