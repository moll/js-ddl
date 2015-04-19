var _ = require("underscore")
var Ddl = require("../..")

exports.mustPassSimpleTable = function(query, define) {
  describe("given a simple table", function() {
    // Might be given a synchronous define function. Ensure it could be
    // yielded.
    define = _.compose(Promise.resolve.bind(Promise), define)

    beforeEach(function*() {
      yield query(
        'CREATE TABLE "test" (' +
        '"id" INTEGER PRIMARY KEY NOT NULL,' +
        '"name" VARCHAR(255) NOT NULL,' +
        '"age" INTEGER DEFAULT 18,' +
        '"notes" TEXT DEFAULT \'\'' +
        ')'
      )

      this.ddl = yield define("test")
    })

    it("must return an instance of Ddl", function() {
      this.ddl.must.be.an.instanceof(Ddl)
    })

    it("must return all column names", function() {
      this.ddl.must.have.keys(["id", "name", "age", "notes"])
    })

    it("must return types", function() {
      this.ddl.id.type.must.equal("number")
      this.ddl.name.type.must.equal("string")
    })

    it("must return types with allowed nulls", function() {
      this.ddl.age.type.must.eql(["number", "null"])
      this.ddl.notes.type.must.eql(["string", "null"])
    })

    it("must not have duplicate names", function() {
      this.ddl.id.must.not.have.property("name")
      this.ddl.name.must.not.have.property("name")
      this.ddl.age.must.not.have.property("name")
      this.ddl.notes.must.not.have.property("name")
    })

    it("must return defaults", function() {
      this.ddl.id.must.have.property("default", null)
      this.ddl.name.must.have.property("default", null)
      this.ddl.age.must.have.property("default", 18)
      this.ddl.notes.must.have.property("default", "")
    })

    it("must not return maxLength for columns without it", function() {
      this.ddl.id.must.not.have.property("limit")
      this.ddl.age.must.not.have.property("limit")
      this.ddl.notes.must.not.have.property("limit")
    })

    it("must return maxLength for varchar", function() {
      this.ddl.name.must.have.property("maxLength", 255)
    })
  })
}

exports.mustPassDefault = function(query, define) {
  describe("given common defaults", function() {
    it("must be set to null given NULL", function*() {
      yield query('CREATE TABLE "test" ("foo" INTEGER DEFAULT NULL)')
      ;(yield define("test")).foo.must.have.property("default", null)
    })

    it("must be set to null given null", function*() {
      yield query('CREATE TABLE "test" ("foo" INTEGER DEFAULT null)')
      ;(yield define("test")).foo.must.have.property("default", null)
    })

    it("must be set to undefined given expression", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT (1 + 2))')
      ;(yield define("test")).foo.must.have.property("default", undefined)
    })
  })
}

exports.mustPassRealDefault = function(query, define) {
  describe("given common defaults", function() {
    it("must be set to 42.69 given 42.69", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT 42.69)')
      ;(yield define("test")).foo.must.have.property("default", 42.69)
    })

    it("must be set to 42000 given 42e3", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT 42e3)')
      ;(yield define("test")).foo.must.have.property("default", 42000)
    })

    it("must be set to 42511 given 42.511e3", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT 42.511e3)')
      ;(yield define("test")).foo.must.have.property("default", 42511)
    })

    it("must be set to 42 given 42.", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT 42.)')
      ;(yield define("test")).foo.must.have.property("default", 42)
    })

    it("must be set to 0.42 given .42", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT .42)')
      ;(yield define("test")).foo.must.have.property("default", 0.42)
    })

    it("must be set to 42000 given 42.e3", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT 42.e3)')
      ;(yield define("test")).foo.must.have.property("default", 42000)
    })

    it("must be set to -42000 given -42.e3", function*() {
      yield query('CREATE TABLE "test" ("foo" REAL DEFAULT -42.e3)')
      ;(yield define("test")).foo.must.have.property("default", -42000)
    })
  })
}

exports.mustPassTextDefault = function(query, define) {
  describe("given common defaults", function() {
    it("must be set given string surrounded by '", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT \'a b c\')')
      ;(yield define("test")).foo.default.must.equal("a b c")
    })

    it("must be set to \" given \" surrounded by '", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT \'"\')')
      ;(yield define("test")).foo.default.must.equal("\"")
    })

    it("must be set to ' given '' surrounded by '", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT \'\'\'\')')
      ;(yield define("test")).foo.default.must.equal("'")
    })

    it("must be set to \"\" given \"\" surrounded by '", function*() {
      yield query('CREATE TABLE "test" ("foo" TEXT DEFAULT \'""\')')
      ;(yield define("test")).foo.default.must.equal("\"\"")
    })
  })
}

exports.mustPassBooleanDefault = function(query, define) {
  describe("given common defaults", function() {
    it("must be set to true given true", function*() {
      yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT true)')
      ;(yield define("test")).foo.must.have.property("default", true)
    })

    it("must be set to false given false", function*() {
      yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT false)')
      ;(yield define("test")).foo.must.have.property("default", false)
    })

    it("must be set to true given 't'", function*() {
      yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'t\')')
      ;(yield define("test")).foo.must.have.property("default", true)
    })

    it("must be set to false given 'f'", function*() {
      yield query('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'f\')')
      ;(yield define("test")).foo.must.have.property("default", false)
    })
  })
}
