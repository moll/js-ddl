exports.attributes = function(conn, table, done) {
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

var NUMERIC = /^\d*(\.\d*)?(e\d+)?$/

function parseDefault(type, value) {
  if (value == null) return null
  if (value.toLowerCase() == "null") return null

  var quote = value[0]
  if (quote == "'") value = value.slice(1, -1).replace("''", "'")
  else if (quote == '"') value = value.slice(1, -1).replace('""', '"')
  // Cannot distinguish expressions from bareword strings so ignoring all
  // non-quoted strings and non-numbers.
  else if (!value.match(NUMERIC)) return null

  switch (type) {
    case String: return value
    case Number: return Number(value)
    case Boolean: return !!Number(value)
    default: return null
  }
}

function parseLimit(type) {
  var limit = type.match(/\((\d+)\)$/)
  return limit && parseInt(limit[1], 10)
}
