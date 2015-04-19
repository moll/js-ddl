var _ = require("underscore")
var Sqlite3 = require("sqlite3")
var denodeify = require("denodeify")

var db = new Sqlite3.Database(":memory:")
db.serialize()

var query = denodeify(db.run.bind(db))
var define = denodeify(require("../..").sqlite3.bind(null, db))

describe("Ddl.sqlite3", function() {
  beforeEach(function*() { yield query("BEGIN TRANSACTION") })
  afterEach(function*() { yield query("ROLLBACK TRANSACTION") })

  require("./_database_test").mustPassSimpleTable(query, define)

  describe("type", function() {
    _({
      BIGINT: "number",
      BLOB: "string",
      BOOLEAN: "boolean",
      CHARACTER: "string",
      CLOB: "string",
      DATE: "string",
      DATETIME: "string",
      DECIMAL: "number",
      DOUBLE: "number",
      "DOUBLE PRECISION": "number",
      FLOAT: "number",
      INT2: "number",
      INT8: "number",
      INT: "number",
      INTEGER: "number",
      MEDIUMINT: "number",
      "NATIVE CHARACTER": "string",
      NCHAR: "string",
      NUMERIC: "number",
      NVARCHAR: "string",
      REAL: "number",
      SMALLINT: "number",
      TEXT: "string",
      TINYINT: "number",
      "UNSIGNED BIG INT": "number",
      VARCHAR: "string",
      "VARYING CHARACTER": "string",
    }).each(function(type, sql) {
      it("must be set to " + type + "given " + sql, function*() {
        yield query('CREATE TABLE "test" ("foo" ' + sql + ' NOT NULL)')
        ;(yield define("test")).foo.type.must.equal(type)
      })
    })

    it("must be set properly given differently cased type", function*() {
      yield query('CREATE TABLE "test" ("foo" Date NOT NULL)')
      ;(yield define("test")).foo.type.must.equal("string")
    })

    it("must be set to String given CUSTOM", function*() {
      yield query('CREATE TABLE "test" ("foo" CUSTOM NOT NULL)')
      ;(yield define("test")).foo.type.must.equal("string")
    })
  })

  describe("default", function() {
    require("./_database_test").mustPassDefault(query, define)

    it("must be set to null given autoincrement", function*() {
      yield query(
        'CREATE TABLE "test" (' +
        '"foo" INTEGER PRIMARY KEY AUTOINCREMENT' +
      ')')

      ;(yield define("test")).foo.must.have.property("default", null)
    })

    describe("of TEXT column", function() {
      require("./_database_test").mustPassTextDefault(query, define)

      it("must be set to ' given ' surrounded by \"", function*() {
        yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT "\'")')
        ;(yield define("test")).foo.default.must.equal("'")
      })

      it("must be set to '' given '' surrounded by \"", function*() {
        yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT "\'\'")')
        ;(yield define("test")).foo.default.must.equal("''")
      })

      it("must be set to \" given \"\" surrounded by \"", function*() {
        yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT """")')
        ;(yield define("test")).foo.default.must.equal("\"")
      })

      it("must be set to undefined given custom", function*() {
        yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT custom)')
        ;(yield define("test")).foo.must.have.property("default", undefined)
      })
    })

    describe("of INTEGER column", function() {
      it("must be set to 42 given 42", function*() {
        yield query('CREATE TABLE "test" ("foo" INTEGER DEFAULT 42)')
        ;(yield define("test")).foo.must.have.property("default", 42)
      })
    })

    describe("of REAL column", function() {
      require("./_database_test").mustPassRealDefault(query, define)
    })

    describe("of BOOLEAN column", function() {
      require("./_database_test").mustPassBooleanDefault(query, define)

      it("must be set to true given 1", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 1)')
        ;(yield define("test")).foo.must.have.property("default", true)
      })

      it("must be set to false given 0", function*() {
        yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 0)')
        ;(yield define("test")).foo.must.have.property("default", false)
      })
    })

    describe("of DATE column", function() {
      it("must be set to undefined given 86400", function*() {
        yield query('CREATE TABLE "test" ("foo" DATETIME DEFAULT 86400)')
        ;(yield define("test")).foo.must.have.property("default", undefined)
      })
    })

    describe("of DATETIME column", function() {
      it("must be set to undefined given 86400", function*() {
        yield query('CREATE TABLE "test" ("foo" DATETIME DEFAULT 86400)')
        ;(yield define("test")).foo.must.have.property("default", undefined)
      })
    })

    describe("of CUSTOM column", function() {
      it("must be set given string surrounded by '", function*() {
        yield query('CREATE TABLE "test" ("foo" CUSTOM DEFAULT \'a b c\')')
        ;(yield define("test")).foo.default.must.equal("a b c")
      })
    })
  })

  describe("maxLength", function() {
    it("must return maxLength for varchar even if zero", function*() {
      yield query(
        'CREATE TABLE "test" (' +
        '"id" INTEGER PRIMARY KEY NOT NULL,' +
        '"name" VARCHAR(0) NOT NULL' +
        ')'
      )

      var ddl = yield define("test")
      ddl.name.must.have.property("maxLength", 0)
    })
  })
})
