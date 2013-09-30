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
