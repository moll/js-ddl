var Pg = require("pg-native")
var Ddl = require("../..")

var db = new Pg
db.connectSync("postgresql://localhost/ddl_test")

var query = db.querySync.bind(db)
var define = require("../..").postgresqlSync.bind(null, db)

describe("Ddl.postgresqlSync", function() {
  beforeEach(function() { query("BEGIN") })
  afterEach(function() { query("ROLLBACK") })

  it("must be synchronous", function() {
    query('CREATE TABLE "test" ("id" INTEGER PRIMARY KEY NOT NULL)')
    var ddl = define("test")
    ddl.must.be.an.instanceof(Ddl)
    ddl.must.have.property("id")
  })

  require("./_database_test").mustPassSimpleTable(query, define)
})
