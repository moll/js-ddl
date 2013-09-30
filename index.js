exports.__defineGetter__("Sqlite3", function() {
  return require("./lib/sqlite3")
})

exports.__defineGetter__("sqlite3", function() {
  return exports.Sqlite3.attributes
})

exports.__defineGetter__("PostgreSQL", function() {
  return require("./lib/postgresql")
})

exports.__defineGetter__("postgresql", function() {
  return exports.PostgreSQL.attributes
})
