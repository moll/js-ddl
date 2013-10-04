Attributes API Documentation
============================
### [Attributes](#Attributes)
- [postgresql](#Attributes.postgresql)(connection, tableName, callback)
- [sqlite3](#Attributes.sqlite3)(connection, tableName, callback)

### [Attribute](#Attribute)
- [default](#attribute.default)
- [limit](#attribute.limit)
- [null](#attribute.null)
- [type](#attribute.type)


<a name="Attributes" />
Attributes
----------
The object returned by the per-database functions below that contains all
of a table's attributes (columns) with the column name as the key and an
[`Attribute`](#Attribute) object as the value.

All attributes of the table are set as enumerable properties of the object.
To go over them, just use a `for in` loop.

**Examples**:
```javascript
Attributes.sqlite3(db, "people", function(err, attrs) {
  for (name in attrs) console.log(name, attrs[name].type)
})
```

<a name="Attributes.postgresql" />
### Attributes.postgresql(connection, tableName, callback)
Queries a PostgreSQL database table for its attributes.

Give it a [`Pg.Client`](https://github.com/brianc/node-postgres/wiki/Client)
for `connection`.

Calls `callback` with an `error` and an [`Attributes`](#Attributes) object.

**Examples**:
```javascript
var Attributes = require("attributes")

var Pg = require("pg")
Pg.defaults.host = "/tmp"
Pg.defaults.database = "assertions_test"
var db = new Pg.Client; db.connect()

Attributes.postgresql(db, "people", console.log)
```

<a name="Attributes.sqlite3" />
### Attributes.sqlite3(connection, tableName, callback)
Queries a SQLite3 database table for its attributes.

Give it a [`Sqlite3.Database`][Sqlite.Database] for `connection`.
[Sqlite.Database]: https://github.com/developmentseed/node-sqlite3/wiki/API

Calls `callback` with an `error` and an [`Attributes`](#Attributes) object.

**Examples**:
```javascript
var Attributes = require("attributes")
var Sqlite3 = require("sqlite3")
var db = new Sqlite3.Database("database.sqlite3")
Attributes.sqlite3(db, "people", console.log)
```


<a name="Attribute" />
Attribute
---------
The object specifying all of a single column's properties.

<a name="attribute.default" />
### attribute.default
Default value for the column already cast to the column type.

**Note**: Only simple expressions are parsed and cast for now. Unsupported
defaults are set to `undefined`.

Only simple defaults are supported because databases store defaults as you
typed them to `CREATE TABLE` without evaluation or normalization. They get
evaluated only when you actually insert rows. That makes it possible for you
to set defaults to `date('now')`, but obviously makes it not-straightforward
to read them back out.

If the default value's format is not supported, it'll be set to `undefined`.
For the most part that is the safest thing — this way when you're later
inserting data, leave out undefined attributes and they'll be properly set by
the database.

Column SQL                | Default
--------------------------|--------
`INTEGER DEFAULT 30      `| `30`
`VARCHAR DEFAULT 'Smith' `| `"Smith"`
`BOOLEAN DEFAULT 't'     `| `true`

<a name="attribute.limit" />
### attribute.limit
For string types it's the maximum number of characters allowed.  Otherwise
it's `null`.

Column SQL    | Limit
--------------|------
`VARCHAR(60) `| `60`
`INTEGER     `| `null`

<a name="attribute.null" />
### attribute.null
`true` or `false` depending if the column allows `NULL` values.

Column SQL         | Null
-------------------|-----
`INTEGER          `| `true`
`INTEGER NOT NULL `| `false`

<a name="attribute.type" />
### attribute.type
Closest JavaScript type for the SQL type.

Either `Number`, `String`, `Boolean` or `Date`.  
Unknown types are left as `String`.

Column SQL    | Type
--------------|-----
`VARCHAR(60) `| `String`
`INTEGER     `| `Number`
`BOOLEAN     `| `Boolean`
`DATETIME    `| `Date`
`DATE        `| `Date`
