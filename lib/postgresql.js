var Fs = require("fs")

  conn.query(getSql(), [table], function(err, resp) {
module.exports = function(conn, table, done) {
    if (err) return done(err)
    done(null, attributify(resp.rows))
  })
}

var SQL
function getSql(table) {
  return SQL || (SQL = Fs.readFileSync(__dirname + "/postgresql.sql", "utf8"))
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

function parseDefault(type, value) {
  if (value == null) return null
  if (value.toLowerCase() == "null") return null

  var quote = value[0]
  if (quote == "'")
    value = value.slice(1, value.lastIndexOf("'")).replace("''", "'")
  else if (quote == '"')
    value = value.slice(1, value.lastIndexOf('"')).replace('""', '"')

  switch (type) {
    case String: return value
    case Number: return Number(value)
    case Boolean: return Boolean(value)
    default: return null
  }
}
