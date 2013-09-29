var Sqlite3 = require("sqlite3")
var db = new Sqlite3.Database(":memory:")
db.serialize()

var attributes = require("..").sqlite3

describe("SQLite3", function() {
  beforeEach(function(done) { db.run("BEGIN TRANSACTION", done) })
  afterEach(function(done) { db.run("ROLLBACK TRANSACTION", done) })

  describe("given a simple table", function() {
    withSql(
      'CREATE TABLE "test" (' +
        '"id" INTEGER PRIMARY KEY,' +
        '"name" VARCHAR(255) NOT NULL,' +
        '"age" INTEGER DEFAULT 18,' +
        '"notes" TEXT DEFAULT \'\'' +
      ')'
    )

    it("must return all column names", function() {
      this.attrs.must.have.keys(["id", "name", "age", "notes"])
    })

    it("must return null statuses", function() {
      this.attrs.id.null.must.be.true()
      this.attrs.name.null.must.be.false()
      this.attrs.age.null.must.be.true()
      this.attrs.notes.null.must.be.true()
    })

    it("must not have duplicate names", function() {
      this.attrs.id.must.not.have.property("name")
      this.attrs.name.must.not.have.property("name")
      this.attrs.age.must.not.have.property("name")
      this.attrs.notes.must.not.have.property("name")
    })

    it("must return types", function() {
      this.attrs.id.type.must.equal(Number)
      this.attrs.name.type.must.equal(String)
      this.attrs.age.type.must.equal(Number)
      this.attrs.notes.type.must.equal(String)
    })

    it("must return defaults", function() {
      this.attrs.id.must.have.property("default", null)
      this.attrs.name.must.have.property("default", null)
      this.attrs.age.must.have.property("default", 18)
      this.attrs.notes.must.have.property("default", "")
    })

    it("must return limits", function() {
      this.attrs.id.must.have.property("limit", null)
      this.attrs.name.must.have.property("limit", 255)
      this.attrs.age.must.have.property("limit", null)
      this.attrs.notes.must.have.property("limit", null)
    })

    xit("must return the raw column info in the raw property", function() {
      this.attrs.id.raw.type.must.equal("INTEGER")
      this.attrs.name.raw.type.must.equal("VARCHAR(255)")
      this.attrs.age.raw.type.must.equal("INTEGER")
      this.attrs.notes.raw.type.must.equal("TEXT")
    })
  })

  describe("types", function() {
    ;[
      "INT",
      "INTEGER",
      "TINYINT",
      "SMALLINT",
      "MEDIUMINT",
      "BIGINT",
      "UNSIGNED BIG INT",
      "INT2",
      "INT8",
      "REAL",
      "DOUBLE",
      "DOUBLE PRECISION",
      "FLOAT",
      "NUMERIC",
      "DECIMAL"
    ].forEach(function(type) {
      describe("given " + type, function() {
        withSql('CREATE TABLE "test" ("foo" ' + type + ')')

        it("must set type to Number", function() {
          this.attrs.foo.type.must.equal(Number)
        })
      })
    })

    ;[
      "CHARACTER",
      "VARCHAR",
      "VARYING CHARACTER",
      "NCHAR",
      "NATIVE CHARACTER",
      "NVARCHAR",
      "TEXT",
      "CLOB",
      "BLOB"
    ].forEach(function(type) {
      describe("given " + type, function() {
        withSql('CREATE TABLE "test" ("foo" ' + type + ')')

        it("must set type to String", function() {
          this.attrs.foo.type.must.equal(String)
        })
      })
    })

    describe("given BOOLEAN", function() {
      withSql('CREATE TABLE "test" ("foo" BOOLEAN)')

      it("must set type to Boolean", function() {
        this.attrs.foo.type.must.equal(Boolean)
      })
    })

    describe("given DATE", function() {
      withSql('CREATE TABLE "test" ("foo" DATE)')

      it("must set type to Date", function() {
        this.attrs.foo.type.must.equal(Date)
      })
    })

    describe("given DATETIME", function() {
      withSql('CREATE TABLE "test" ("foo" DATETIME)')

      it("must set type to Date", function() {
        this.attrs.foo.type.must.equal(Date)
      })
    })

    describe("given CUSTOM", function() {
      withSql('CREATE TABLE "test" ("foo" CUSTOM)')

      it("must set type to String", function() {
        this.attrs.foo.type.must.equal(String)
      })
    })
  })

  function withSql(sql, fn) {
    beforeEach(db.run.bind(db, sql))
    beforeEach(withAttrs(function(attrs) { this.attrs = attrs }))
  }

  function withAttrs(fn) {
    return function(done) {
      var self = this
      attributes(db, "test", function(err, attrs) {
        fn.call(self, attrs)
        done(err)
      })
    }
  }
})
