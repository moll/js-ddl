var unquote = require("./utils").unquote

/**
 * Queries a SQLite3 database table for its attributes.
 *
 * Give it a [`Sqlite3.Database`][Sqlite.Database] for `connection`.
 * [Sqlite.Database]: https://github.com/developmentseed/node-sqlite3/wiki/API
 *
 * Calls `callback` with an `error` and an [`Attributes`](#Attributes) object.
 *
 * @example
 * var Attributes = require("attributes")
 * var Sqlite3 = require("sqlite3")
 * var db = new Sqlite3.Database("database.sqlite3")
 * Attributes.sqlite3(db, "people", console.log)
 *
 * @static
 * @method sqlite3
 * @param connection
 * @param tableName
 * @param callback
 */
module.exports = function(conn, table, done) {
  var sql = 'PRAGMA table_info("' + escape(table) + '")'

  return conn.all(sql, function(err, columns) {
    if (err) return done(err)
    done(null, attributify(columns))
  })
}

function attributify(columns) {
  return columns.reduce(function(attrs, column) {
    var attr = attrs[column.name] = {}
    attr.null = !column.notnull
    attr.type = parseType(column.type)
    attr.default = parseDefault(attr.type, column.dflt_value)
    attr.limit = parseLimit(column.type)

    return attrs
  }, {})
}

function escape(name) {
  return name.replace('"', '""')
}

function quote(name) {
  return '"' + escape(name) + '"'
}

// https://www.sqlite.org/datatype3.html
var TYPES = {
  // Affinity INTEGER:
  INT: Number,
  INTEGER: Number,
  TINYINT: Number,
  SMALLINT: Number,
  MEDIUMINT: Number,
  BIGINT: Number,
  "UNSIGNED BIG INT": Number,
  INT2: Number,
  INT8: Number,

  // Affinity TEXT:
  CHARACTER: String,
  VARCHAR: String,
  "VARYING CHARACTER": String,
  NCHAR: String,
  "NATIVE CHARACTER": String,
  NVARCHAR: String,
  TEXT: String,
  CLOB: String,

  // Affinity NONE:
  BLOB: String,

  // Affinity REAL:
  REAL: Number,
  DOUBLE: Number,
  "DOUBLE PRECISION": Number,
  FLOAT: Number,

  // Affinity NUMERIC:
  NUMERIC: Number,
  DECIMAL: Number,

  // Affinity NUMERIC, but JS type different:
  BOOLEAN: Boolean,
  DATE: Date,
  DATETIME: Date,
}

function parseType(type) {
  var type = type.match(/^([^(]+)/)
  return TYPES[type && type[0].toUpperCase()] || String
}

var TRUES = require("./utils").TRUES
var FALSES = require("./utils").FALSES
var NUMERIC = require("./utils").NUMERIC

function parseDefault(type, value) {
  if (value == null) return null
  if (value.toLowerCase() == "null") return null

  switch (type) {
    case String:
      if (value[0] != '"' && value[0] != "'") return undefined
      return unquote(value)

    case Number:
      value = unquote(value)
      if (!value.match(NUMERIC)) return undefined
      return Number(value)

    case Boolean:
      value = unquote(value)
      if (~TRUES.indexOf(value)) return true
      if (~FALSES.indexOf(value)) return false
      return undefined

    default: return undefined
  }
}

function parseLimit(type) {
  var limit = type.match(/\((\d+)\)$/)
  return limit && parseInt(limit[1], 10)
}
