var define = require("lazy-object").defineLazyProperty
module.exports = Ddl

/**
 * The object returned by the per-database functions below that contains all
 * of a table's columns with the column name as the key and an
 * [`Attribute`](#Attribute) object as the value.
 *
 * All columns of the table are set as enumerable properties of the object.
 * To go over them, just use a `for in` loop.
 *
 * @example
 * Ddl.sqlite3(db, "people", function(err, ddl) {
 *   for (name in ddl) console.log(name, ddl[name].type)
 * })
 *
 * @class Ddl
 */
function Ddl() {}

define(Ddl, "sqlite3", function() {
  return require("./lib/sqlite3")
})

define(Ddl, "postgresql", function() {
  return require("./lib/postgresql")
})

define(Ddl, "postgresqlSync", function() {
  return require("./lib/postgresql_sync")
})

/**
 * The object specifying all properties of a single attribute or database
 * column.
 *
 * @class Attribute
 */

/**
 * Closest JavaScript type for the SQL type.
 *
 * Either the type as a **string** (e.g.` "number"`) or, should the column
 * allow `NULL` values, an **array** with the type and `"null"`
 * (e.g. `["number", "null"]`).
 *
 * Column SQL    | Type
 * --------------|-----
 * `VARCHAR(60) `| `"string"`
 * `REAL        `| `"number"`
 * `NUMERIC     `| `"number"`
 * `SMALLINT    `| `"integer"`
 * `INTEGER     `| `"integer"`
 * `BIGINT      `| `"integer"`
 * `BOOLEAN     `| `"boolean"`
 * `DATETIME    `| `"string"`
 * `DATE        `| `"string"`
 * `JSON        `| `"object"`
 * `JSONB       `| `"object"`
 *
 * @property type
 */

/**
 * Default value for the column already cast to the column type.
 *
 * **Note**: Only simple expressions are parsed and cast for now. Unsupported
 * defaults are set to `undefined`.
 *
 * Only simple defaults are supported because databases store defaults as you
 * typed them to `CREATE TABLE` without evaluation or normalization. They get
 * evaluated only when you actually insert rows. That makes it possible for you
 * to set defaults to `date('now')`, but obviously makes it not-straightforward
 * to read them back out.
 *
 * If the default value's format is not supported, it'll be set to `undefined`.
 * For the most part that is the safest thing — this way when you're later
 * inserting data, leave out undefined columns and they'll be properly set by
 * the database.
 *
 * Column SQL                | Default
 * --------------------------|--------
 * `INTEGER DEFAULT 30      `| `30`
 * `VARCHAR DEFAULT 'Smith' `| `"Smith"`
 * `BOOLEAN DEFAULT 't'     `| `true`
 *
 * @property default
 */

/**
 * For string types with a limit it's the maximum number of characters allowed.
 * Otherwise not set.
 *
 * Column SQL    | Limit
 * --------------|------
 * `VARCHAR(60) `| `60`
 * `INTEGER     `| *not set*
 *
 * @property maxLength
 */
