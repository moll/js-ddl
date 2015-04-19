var Ddl = require("..")
var Fs = require("fs")
var unquote = require("./utils").unquote
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
    var attr = ddl[column.attname] = {}

    var type = parseType(column.type)
    attr.type = column.attnotnull ? type : [type, "null"]
    attr.default = parseDefault(type, column.default)
    if (column.atttypmod > 0) attr.maxLength = column.atttypmod - 4

    return ddl
  }, new Ddl)
}

// http://www.postgresql.org/docs/9.2/static/datatype.html
var TYPES = {
  BIGINT: "number",
  BIGSERIAL: "number",
  BOOLEAN: "boolean",
  "CHARACTER VARYING": "string",
  CHARACTER: "string",
  DATE: "string",
  "DOUBLE PRECISION": "number",
  INTEGER: "number",
  NUMERIC: "number",
  REAL: "number",
  SMALLINT: "number",
  SMALLSERIAL: "number",
  SERIAL: "number",
  TEXT: "string",
  "TIME WITHOUT TIME ZONE": "string",
  "TIMESTAMP WITHOUT TIME ZONE": "string"
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
  value = stripcast(value)

  switch (type) {
    case "string":
      // PostgreSQL is precise about using only single qutoes for string
      // literals. As opposed to SQLite, for example.
      if (value[0] != "'") return undefined
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

function stripcast(val) {
  return val.match(/::[\w ]+$/) ? val.match(/^\(?(.*?)\)?::[\w ]+$/)[1] : val
}
