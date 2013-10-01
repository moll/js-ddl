exports.__defineGetter__("sqlite3", function() {
  return require("./lib/sqlite3")
})

exports.__defineGetter__("postgresql", function() {
  return require("./lib/postgresql")
})
