/**
 * The object returned by the per-database functions below that contains all
 * of a table's attributes (columns) with the column name as the key and an
 * [`Attribute`](#Attribute) object as the value.
 *
 * All attributes of the table are set as enumerable properties of the object.
 * To go over them, just use a `for in` loop.
 *
 * @example
 * Attributes.sqlite3(db, "people", function(err, attrs) {
 *   for (name in attrs) console.log(name, attrs[name].type)
 * })
 *
 * @class Attributes
 */

exports.__defineGetter__("sqlite3", function() {
  return require("./lib/sqlite3")
})

exports.__defineGetter__("postgresql", function() {
  return require("./lib/postgresql")
})

/**
 * The object specifying all of a single column's properties.
 *
 * @class Attribute
 */

/**
 * `true` or `false` depending if the column allows `NULL` values.
 *
 * Column SQL         | Null
 * -------------------|-----
 * `INTEGER          `| `true`
 * `INTEGER NOT NULL `| `false`
 *
 * @property null
 */

/**
 * Closest JavaScript type for the SQL type.
 *
 * Either `Number`, `String`, `Boolean` or `Date`.  
 * Unknown types are left as `String`.
 *
 * Column SQL    | Type
 * --------------|-----
 * `VARCHAR(60) `| `String`
 * `INTEGER     `| `Number`
 * `BOOLEAN     `| `Boolean`
 * `DATETIME    `| `Date`
 * `DATE        `| `Date`
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
 * inserting data, leave out undefined attributes and they'll be properly set by
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
 * For string types it's the maximum number of characters allowed.  Otherwise
 * it's `null`.
 *
 * Column SQL    | Limit
 * --------------|------
 * `VARCHAR(60) `| `60`
 * `INTEGER     `| `null`
 *
 * @property limit
 */
