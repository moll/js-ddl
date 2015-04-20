var Ddl = require("..")
var unquote = require("./utils").unquote
module.exports = sqlite3

/**
 * Queries a SQLite3 database table for its data definition.
 *
 * Give it a [`Sqlite3.Database`][Sqlite.Database] for `connection`.  
 * Calls `callback` with an `error` and a [`Ddl`](#Ddl) object with attributes.
 *
 * [Sqlite.Database]: https://github.com/developmentseed/node-sqlite3/wiki/API
 *
 * @example
 * var Ddl = require("ddl")
 * var Sqlite3 = require("sqlite3")
 * var db = new Sqlite3.Database("database.sqlite3")
 *
 * Ddl.sqlite3(db, "people", console.log)
 *
 * @static
 * @method sqlite3
 * @param connection
 * @param tableName
 * @param callback
 */
function sqlite3(conn, table, done) {
  var sql = "PRAGMA table_info(\"" + escape(table) + "\")"

  return conn.all(sql, function(err, columns) {
    if (err) return done(err)
    done(null, attributify(columns))
  })
}

function attributify(columns) {
  return columns.reduce(function(ddl, column) {
    var attr = ddl[column.name] = {}

    var type = parseType(column.type)
    attr.type = column.notnull ? type : [type, "null"]
    attr.default = parseDefault(type, column.dflt_value)

    var limit = parseLimit(column.type)
    if (limit != null) attr.maxLength = limit

    return ddl
  }, new Ddl)
}

function escape(name) {
  return name.replace('"', '""')
}

// https://www.sqlite.org/datatype3.html
var TYPES = {
  // Affinity INTEGER:
  INT: "integer",
  INTEGER: "integer",
  TINYINT: "integer",
  SMALLINT: "integer",
  MEDIUMINT: "integer",
  BIGINT: "integer",
  "UNSIGNED BIG INT": "integer",
  INT2: "integer",
  INT8: "integer",

  // Affinity TEXT:
  CHARACTER: "string",
  VARCHAR: "string",
  "VARYING CHARACTER": "string",
  NCHAR: "string",
  "NATIVE CHARACTER": "string",
  NVARCHAR: "string",
  TEXT: "string",
  CLOB: "string",

  // Affinity NONE:
  BLOB: "string",

  // Affinity REAL:
  REAL: "number",
  DOUBLE: "number",
  "DOUBLE PRECISION": "number",
  FLOAT: "number",

  // Affinity NUMERIC:
  NUMERIC: "number",
  DECIMAL: "number",

  // Affinity NUMERIC, but JS type different:
  BOOLEAN: "boolean",
  DATE: "string",
  DATETIME: "string",
}

function parseType(type) {
  type = type.match(/^([^(]+)/)
  return TYPES[type && type[0].toUpperCase()] || "string"
}

var TRUES = require("./utils").TRUES
var FALSES = require("./utils").FALSES
var NUMERIC = require("./utils").NUMERIC

function parseDefault(type, value) {
  if (value == null) return null
  if (value.toLowerCase() == "null") return null

  switch (type) {
    case "string":
      if (value[0] != '"' && value[0] != "'") return undefined
      return unquote(value)

    case "number":
      value = unquote(value)
      if (!value.match(NUMERIC)) return undefined
      return Number(value)

    case "boolean":
      value = unquote(value)
      if (~TRUES.indexOf(value)) return true
      if (~FALSES.indexOf(value)) return false
      return undefined

    default: return undefined
  }
}

function parseLimit(type) {
  var limit = type.match(/\((\d+)\)$/)
  return limit ? Number(limit[1]) : null
}
