var Ddl = require("..")

describe("Ddl", function() {
  describe("new", function() {
    it("must be an instance of Ddl", function() {
      new Ddl().must.be.an.instanceof(Ddl)
    })

    it("must have no enumerable properties", function() {
      new Ddl().must.be.empty()
    })
  })
})
