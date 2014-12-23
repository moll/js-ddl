var Postgresql = require("./postgresql")
var attributify = Postgresql.attributify
var SQL = Postgresql.SQL
module.exports = postgresqlSync

/**
 * Queries a PostgreSQL database table for its data definition synchronously.
 *
 * Give it a native [`PgClient`](https://github.com/brianc/node-pg-native) for
 * `connection`.  
 * Returns a [`Ddl`](#Ddl) object with attributes.
 *
 * @example
 * var Ddl = require("ddl")
 * var Pg = require("pg-native")
 *
 * var db = new Pg
 * db.connectSync("postgresql://localhost/world")
 *
 * Ddl.postgresqlSync(db, "people")
 *
 * @static
 * @method postgresqlSync
 * @param connection
 * @param tableName
 */
function postgresqlSync(conn, table) {
  return attributify(conn.querySync(SQL, [table]))
}
