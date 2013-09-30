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
    ;[
      "BIGINT",
      "BIGSERIAL",
      "BOOLEAN",
      "DOUBLE PRECISION",
      "INTEGER",
      "NUMERIC",
      "REAL",
      "SMALLINT",
      "SMALLSERIAL",
      "SERIAL"
    ].forEach(function(type) {
      describe("given " + type, function() {
        withSql('CREATE TABLE "test" ("foo" ' + type + ')')

        it("must be set to Number", function() {
          this.attrs.foo.type.must.equal(Number)
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
