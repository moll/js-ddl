var Fs = require("fs")
var unquote = require("./utils").unquote

var SQL = Fs.readFileSync(__dirname + "/postgresql.sql", "utf8")

/**
 * Queries a PostgreSQL database table for its attributes.
 *
 * Give it a [`Pg.Client`](https://github.com/brianc/node-postgres/wiki/Client)
 * for `connection`.
 *
 * Calls `callback` with an `error` and an [`Attributes`](#Attributes) object.
 *
 * @example
 * var Attributes = require("attributes")
 *
 * var Pg = require("pg")
 * Pg.defaults.host = "/tmp"
 * Pg.defaults.database = "assertions_test"
 * var db = new Pg.Client; db.connect()
 *
 * Attributes.postgresql(db, "people", console.log)
 *
 * @static
 * @method postgresql
 * @param connection
 * @param tableName
 * @param callback
 */
module.exports = function(conn, table, done) {
  conn.query(SQL, [table], function(err, resp) {
    if (err) return done(err)
    done(null, attributify(resp.rows))
  })
}

function attributify(columns) {
  return columns.reduce(function(attrs, column) {
    var attr = attrs[column.attname] = {}
    attr.null = !column.attnotnull
    attr.type = parseType(column.type)
    attr.default = parseDefault(attr.type, column.default)
    attr.limit = column.atttypmod > 0 ? column.atttypmod - 4 : null

    return attrs
  }, {})
}

// http://www.postgresql.org/docs/9.2/static/datatype.html
var TYPES = {
  BIGINT: Number,
  BIGSERIAL: Number,
  BOOLEAN: Boolean,
  "CHARACTER VARYING": String,
  CHARACTER: String,
  DATE: Date,
  "DOUBLE PRECISION": Number,
  INTEGER: Number,
  NUMERIC: Number,
  REAL: Number,
  SMALLINT: Number,
  SMALLSERIAL: Number,
  SERIAL: Number,
  TEXT: String,
  "TIME WITHOUT TIME ZONE": Date,
  "TIMESTAMP WITHOUT TIME ZONE": Date
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
  value = stripcast(value)

  switch (type) {
    case String:
      // PostgreSQL is precise about using only single qutoes for string
      // literals. As opposed to SQLite, for example.
      if (value[0] != "'") return undefined
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

function stripcast(val) {
  return val.match(/::[\w ]+$/) ? val.match(/^\(?(.*?)\)?::[\w ]+$/)[1] : val
}
