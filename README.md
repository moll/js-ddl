DDL.js
======
[![NPM version][npm-badge]](http://badge.fury.io/js/ddl)
[npm-badge]: https://badge.fury.io/js/ddl.png

DDL.js is a **data definition language** to unify database and model schema
descriptions for use in JavaScript.  It also has functions to help **query
databases** (currently **PostgreSQL** and **SQLite3**) for their existing
**table schemas** and attributes.

You can use DDL.js for **introspection**, to **prepare your domain models** and
set up **simple type coercions or validations** for those database columns.
This way you can have the same convenience that Ruby on Rails's ActiveRecord
provides, but in the JavaScript world. I made this for the decoupled domain
model library [Soul.js][soul.js] that I'm writing.

DDL.js is open for extension and modifications, so if you have suggestions what
more it should define or query from the database, please ping me with an
[email][email], a [tweet][twitter] or [create an issue][issues] on GitHub.

[soul.js]: https://github.com/moll/js-soul


Installing
----------
```sh
npm install ddl
```

DDL.js follows [semantic versioning](http://semver.org/), so feel free to depend
on its major version with something like `>= 1.0.0 < 2` (a.k.a `^1.0.0`).


Using
-----
Each database has its own function you can call passing it the connection to
that database and the table name you'd like to get a data definition for. Look
at [DDL.js API Documentation][api] for a list of supported databases.

Given the following table:
```sql
CREATE TABLE "golfers" (
  "name" VARCHAR(255) DEFAULT 'Tiger' NOT NULL,
  "handicap" INTEGER DEFAULT 52 NOT NULL,
  "updated_at" DATETIME
)
```

And the following code:
```javascript
var Pg = require("pg")

var db = new Pg.Client
db.connect({database: "golf"})

var Ddl = require("ddl")
Ddl.postgresql(db, "golfers", function(err, ddl) {})
```

Your callback will be called with the following object for `ddl`:
```javascript
{
  name: {null: false, type: String, default: "Tiger", limit: 255},
  handicap: {null: false, type: Number, default: 52, limit: null},
  updated_at: {null: true, type: Date, default: null, limit: null}
}
```

This works well if you have a single JavaScript "class" or model per database
table. With DDL.js you can initialize that model's attributes and their
default values without having to manually keep the database and the model
declaration in sync.


API
---
For extended documentation, please see the [DDL.js API Documentation][api].
[api]: https://github.com/moll/js-ddl/blob/master/doc/API.md

### [Ddl](https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl)
- [postgresql](https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl.postgresql)(connection, tableName, callback)
- [sqlite3](https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl.sqlite3)(connection, tableName, callback)

### [Attribute](https://github.com/moll/js-ddl/blob/master/doc/API.md#Attribute)
- [default](https://github.com/moll/js-ddl/blob/master/doc/API.md#attribute.default)
- [limit](https://github.com/moll/js-ddl/blob/master/doc/API.md#attribute.limit)
- [null](https://github.com/moll/js-ddl/blob/master/doc/API.md#attribute.null)
- [type](https://github.com/moll/js-ddl/blob/master/doc/API.md#attribute.type)


License
-------
DDL.js is released under a *Lesser GNU Affero General Public License*, which in
summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g bug-fixes) you've made to this
  program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll][moll]** typed this and the code.  
[Monday Calendar][monday] supported the engineering work.

If you find DDL.js needs improving, please don't hesitate to type to me now
at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-ddl/issues
[moll]: http://themoll.com
[monday]: https://mondayapp.com
[twitter]: https://twitter.com/theml
