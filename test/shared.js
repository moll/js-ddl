exports.mustPassSimpleTable = function(withSql) {
  withSql(
    'CREATE TABLE "test" (' +
      '"id" INTEGER PRIMARY KEY NOT NULL,' +
      '"name" VARCHAR(255) NOT NULL,' +
      '"age" INTEGER DEFAULT 18,' +
      '"notes" TEXT DEFAULT \'\'' +
    ')'
  )

  it("must return all column names", function() {
    this.attrs.must.have.keys(["id", "name", "age", "notes"])
  })

  it("must return null statuses", function() {
    this.attrs.id.null.must.be.false()
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
}

exports.mustPassDefault = function(withSql) {
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

    it("must be set to undefined", function() {
      this.attrs.foo.must.have.property("default", undefined)
    })
  })
}

exports.mustPassRealDefault = function(withSql) {
  describe("given 42.69", function() {
    withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.69)')

    it("must be set to 42.69", function() {
      this.attrs.foo.must.have.property("default", 42.69)
    })
  })

  describe("given 42e3", function() {
    withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42e3)')

    it("must be set to 42000", function() {
      this.attrs.foo.must.have.property("default", 42000)
    })
  })

  describe("given 42.511e3", function() {
    withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.511e3)')

    it("must be set to 42511", function() {
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

    it("must be set to 0.42", function() {
      this.attrs.foo.must.have.property("default", .42)
    })
  })

  describe("given 42.e3", function() {
    withSql('CREATE TABLE "test" ("foo" REAL DEFAULT 42.e3)')

    it("must be set to 42000", function() {
      this.attrs.foo.must.have.property("default", 42000)
    })
  })

  describe("given -42.e3", function() {
    withSql('CREATE TABLE "test" ("foo" REAL DEFAULT -42.e3)')

    it("must be set to -42000", function() {
      this.attrs.foo.must.have.property("default", -42000)
    })
  })
}

exports.mustPassTextDefault = function(withSql) {
  describe("given string surrounded by '", function() {
    withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'a b c\')')

    it("must be set", function() {
      this.attrs.foo.default.must.equal("a b c")
    })
  })

  describe("given \" surrounded by '", function() {
    withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'"\')')

    it("must be set to \"", function() {
      this.attrs.foo.default.must.equal("\"")
    })
  })

  describe("given '' surrounded by '", function() {
    withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'\'\'\')')

    it("must be set to '", function() {
      this.attrs.foo.default.must.equal("'")
    })
  })

  describe("given \"\" surrounded by '", function() {
    withSql('CREATE TABLE "test" ("foo" TEXT DEFAULT \'""\')')

    it("must be set to \"\"", function() {
      this.attrs.foo.default.must.equal("\"\"")
    })
  })
}

exports.mustPassBooleanDefault = function(withSql) {
  describe("given true", function() {
    withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT true)')

    it("must be set to true", function() {
      this.attrs.foo.must.have.property("default", true)
    })
  })

  describe("given false", function() {
    withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT false)')

    it("must be set to false", function() {
      this.attrs.foo.must.have.property("default", false)
    })
  })

  describe("given 't'", function() {
    withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'t\')')

    it("must be set to true", function() {
      this.attrs.foo.must.have.property("default", true)
    })
  })

  describe("given 'f'", function() {
    withSql('CREATE TABLE "test" ("foo" BOOLEAN DEFAULT \'f\')')

    it("must be set to false", function() {
      this.attrs.foo.must.have.property("default", false)
    })
  })
}
