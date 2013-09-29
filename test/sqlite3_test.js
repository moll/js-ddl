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

    describe("given lower-case DATE", function() {
      withSql('CREATE TABLE "test" ("foo" date)')

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

  describe("default", function() {
    describe("given NULL", function() {
      withSql('CREATE TABLE "test" ("foo" INTEGER DEFAULT NULL)')

      it("must be set to null", function() {
        this.attrs.foo.must.have.property("default", null)
      })
    })

    describe("given null", function() {
      withSql('CREATE TABLE "test" ("foo" INTEGER DEFAULT null)')

      it("must be set to null", function() {
        this.attrs.foo.must.have.property("default", null)
      })
    })

    describe("given expression", function() {
      withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT (1 + 2))')

      it("must be set to null", function() {
        this.attrs.foo.must.have.property("default", null)
      })
    })

    describe("of TEXT column", function() {
      describe("given string surrounded by '", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'a b c\')')

        it("must be set", function() {
          this.attrs.foo.default.must.equal("a b c")
        })
      })

      describe("given ' surrounded by \"", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT "\'")')

        it("must be set to '", function() {
          this.attrs.foo.default.must.equal("'")
        })
      })

      describe("given '' surrounded by '", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'\'\'\')')

        it("must be set to '", function() {
          this.attrs.foo.default.must.equal("'")
        })
      })

      describe("given '' surrounded by \"", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT "\'\'")')

        it("must be set to ''", function() {
          this.attrs.foo.default.must.equal("''")
        })
      })

      describe("given \" surrounded by '", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'"\')')

        it("must be set to \"", function() {
          this.attrs.foo.default.must.equal("\"")
        })
      })

      describe("given \"\" surrounded by \"", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT """")')

        it("must be set to \"", function() {
          this.attrs.foo.default.must.equal("\"")
        })
      })

      describe("given \"\" surrounded by '", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'""\')')

        it("must be set to \"\"", function() {
          this.attrs.foo.default.must.equal("\"\"")
        })
      })

      describe("given custom", function() {
        withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT custom)')

        it("must be set to null", function() {
          this.attrs.foo.must.have.property("default", null)
        })
      })
    })

    describe("of INTEGER column", function() {
      describe("given 42", function() {
        withSql('CREATE TABLE "test" ("foo" INTEGER DEFAULT 42)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42)
        })
      })
    })

    describe("of REAL column", function() {
      describe("given 42.69", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.69)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42.69)
        })
      })

      describe("given 42e3", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42e3)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42000)
        })
      })

      describe("given 42.511e3", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.511e3)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42511)
        })
      })

      describe("given 42.", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42)
        })
      })

      describe("given .42", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT .42)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", .42)
        })
      })

      describe("given 42.e3", function() {
        withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.e3)')

        it("must be set to 42", function() {
          this.attrs.foo.must.have.property("default", 42000)
        })
      })
    })

    describe("of BOOLEAN column", function() {
      describe("given 1", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 1)')

        it("must be set to true", function() {
          this.attrs.foo.must.have.property("default", true)
        })
      })

      describe("given 0", function() {
        withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT 0)')

        it("must be set to false", function() {
          this.attrs.foo.must.have.property("default", false)
        })
      })
    })

    describe("of DATE column", function() {
      describe("given 86400", function() {
        withSql('CREATE TABLE "test" ("foo" DATETIME DEFAULT 86400)')

        it("must be set to null", function() {
          this.attrs.foo.must.have.property("default", null)
        })
      })
    })

    describe("of DATETIME column", function() {
      describe("given 86400", function() {
        withSql('CREATE TABLE "test" ("foo" DATETIME DEFAULT 86400)')

        it("must be set to null", function() {
          this.attrs.foo.must.have.property("default", null)
        })
      })
    })

    describe("of CUSTOM column", function() {
      describe("given string surrounded by '", function() {
        withSql('CREATE TABLE "test" ("foo" CUSTOM DEFAULT \'a b c\')')

        it("must be set", function() {
          this.attrs.foo.default.must.equal("a b c")
        })
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
