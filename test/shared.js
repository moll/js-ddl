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

exports.mustPassRealColumnDefault = function(withSql) {
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
