Attributes for Node.js
======================
[![NPM version][npm-badge]](http://badge.fury.io/js/attributes)
[npm-badge]: https://badge.fury.io/js/attributes.png

Attributes allows you to **easily query a database (currently PostgreSQL or
Sqlite3) for its schema** — columns or *attributes* — and get their properties
such as name, type and default value, in a common format.

You can use this for **introspection**, to **prepare your domain models** and
set up **simple type coercions**.  This way you can have the same convenience
that Ruby on Rails's ActiveRecord provides, but in the JavaScript world. Saves
you from duplicating your model schema.

Attributes is most useful together with a model library that can make use of
it automatically, but you can also just use with plain old JavaScript objects.
I made this for the decoupled domain model library [Soul.js][soul.js] that I'm
writing.

[soul.js]: https://github.com/moll/js-soul


Installing
----------
**Note**: Must.js will follow the [semantic versioning](http://semver.org/)
starting from v1.0.0.

```
npm install attributes
```


Using
-----
Each database has its own function you can call passing it the connection to
that database and the table name you'd like to get attributes for. 

For example, with Sqlite3, just initialize the `Database` object and pass that
to `Attributes.sqlite3`:
```javascript
var Sqlite3 = require("sqlite3")
var db = new Sqlite3.Database("database.sqlite3")
var Attributes = require("attributes")
Attributes.sqlite3(db, "people", console.log)
```

For now, you'll have to know the table name in advance.

This works well if you have a single JavaScript "class" or model per database
table. With Attributes you can initialize that model's attributes and their
default values without having to manually keep the database and the model
declaration in sync.

### Full example
Given the following table:
```sql
CREATE TABLE "golfers" (
  "name" VARCHAR(255) DEFAULT 'Tiger' NOT NULL,
  "handicap" INTEGER DEFAULT 52 NOT NULL,
  "created_at" DATETIME
)
```

Calling Attributes:
```javascript
var Pg = require("pg")
Pg.defaults.database = "golf"

var db = new Pg.Client
db.connect()

var Attributes = require("./")
Attributes.postgresql(db, "golfers", function(err, attributes) {})
```

Will call the callback with the following object for `attributes`:
```javascript
{
  name: {null: false, type: String, default: "Tiger", limit: 255},
  handicap: {null: false, type: Number, default: 52, limit: null},
  updated_at: {null: true, type: Date, default: null, limit: null}
}
```


API
---
For extended documentation, please see the [Attributes API Documentation][api].
[api]: https://github.com/moll/node-attributes/blob/master/doc/API.md

### [Attributes](https://github.com/moll/node-attributes/blob/master/doc/API.md#Attributes)
- [postgresql](https://github.com/moll/node-attributes/blob/master/doc/API.md#Attributes.postgresql)(connection, tableName, callback)
- [sqlite3](https://github.com/moll/node-attributes/blob/master/doc/API.md#Attributes.sqlite3)(connection, tableName, callback)

### [Attribute](https://github.com/moll/node-attributes/blob/master/doc/API.md#Attribute)
- [default](https://github.com/moll/node-attributes/blob/master/doc/API.md#attribute.default)
- [limit](https://github.com/moll/node-attributes/blob/master/doc/API.md#attribute.limit)
- [null](https://github.com/moll/node-attributes/blob/master/doc/API.md#attribute.null)
- [type](https://github.com/moll/node-attributes/blob/master/doc/API.md#attribute.type)


License
-------
Attributes is released under a *Lesser GNU Affero General Public License*, which
in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g bug-fixes) you've made to this
  program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll](http://themoll.com)** typed this and the code.  
[Monday Calendar](https://mondayapp.com) supported the engineering work.

If you find Attributes needs improving, please don't hesitate to type to me now
at [andri@dot.ee](mailto:andri@dot.ee) or [create an issue
online](https://github.com/moll/node-attributes/issues).
