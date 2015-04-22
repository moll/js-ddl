var Ddl = require("..")
var Fs = require("fs")
var unquote = require("./utils").unquote
var defineHiddenProperty = require("./utils").defineHiddenProperty
var SQL = Fs.readFileSync(__dirname + "/postgresql.sql", "utf8")
exports = module.exports = postgresql

/**
 * Queries a PostgreSQL database table for its data definition.
 *
 * Give it a [`Pg.Client`](https://github.com/brianc/node-postgres/wiki/Client)
 * for `connection`.  
 * Calls `callback` with an `error` and a [`Ddl`](#Ddl) object with attributes.
 *
 * @example
 * var Ddl = require("ddl")
 * var Pg = require("pg")
 *
 * var db = new Pg.Client("postgresql://localhost/world")
 * db.connect()
 *
 * Ddl.postgresql(db, "people", console.log)
 *
 * @static
 * @method postgresql
 * @param connection
 * @param tableName
 * @param callback
 */
function postgresql(conn, table, done) {
  conn.query(SQL, [table], function(err, resp) {
    if (err) return done(err)
    done(null, attributify(resp.rows))
  })
}

exports.SQL = SQL
exports.attributify = attributify

function attributify(columns) {
  return columns.reduce(function(ddl, column) {
    if (column.type == "ARRAY") column.udt += repeat(column.dimensions-1, "[]")
    var attr = ddl[column.name] = typeify(column.udt, column.nullable)

    if (column.type != "ARRAY") {
      attr.default = parseDefault(column.default, parseType(column.type))
    }

    if (column.length != null) attr.maxLength = column.length

    // Don't depend on _* properties being stable between minor versions.
    // They're experimental until I figure out how to pass custom types via
    // JSON Schema which has no concept of dates, times etc.
    defineHiddenProperty(attr, "_type", column.udt.toUpperCase())

    return ddl
  }, new Ddl)
}

// http://www.postgresql.org/docs/9.2/static/datatype.html
var TYPES = {
  BIGSERIAL: "integer",
  BOOLEAN: "boolean",
  "CHARACTER VARYING": "string",
  CHARACTER: "string",
  DATE: "string",
  BIGINT: "integer",
  "DOUBLE PRECISION": "number",
  INTEGER: "integer",
  JSON: "object",
  JSONB: "object",
  NUMERIC: "number",
  REAL: "number",
  SMALLINT: "integer",
  SMALLSERIAL: "integer",
  SERIAL: "integer",
  TEXT: "string",
  "TIME WITHOUT TIME ZONE": "string",
  "TIMESTAMP WITHOUT TIME ZONE": "string"
}

var ARRAY = /\[\]$/
var TRUES = require("./utils").TRUES
var FALSES = require("./utils").FALSES
var NUMERIC = require("./utils").NUMERIC

function typeify(pgType, nullable) {
  var isArray = pgType.match(ARRAY)
  var attr = {type: isArray ? "array" : parseType(pgType)}
  if (nullable) attr.type = [attr.type, "null"]
  if (isArray) attr.items = typeify(pgType.replace(ARRAY, ""))
  return attr
}

function parseType(type) {
  type = type.match(/^([^(]+)/)
  return TYPES[type && type[0].toUpperCase()] || "string"
}

function parseDefault(value, type) {
  if (value == null) return null
  if (value.toLowerCase() == "null") return null
  value = stripCast(value)

  switch (type) {
    case "string":
      // PostgreSQL is precise about using only single qutoes for string
      // literals. As opposed to SQLite, for example.
      if (value[0] != "'") return undefined
      return unquote(value)

    case "integer":
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

function stripCast(val) {
  return val.match(/::[\w ]+$/) ? val.match(/^\(?(.*?)\)?::[\w ]+$/)[1] : val
}

function repeat(n, string) {
  if (n == 0) return ""
  if (n == 1) return string
  return new Array(n + 1).join(string)
}
