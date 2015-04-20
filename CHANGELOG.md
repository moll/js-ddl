## Unreleased
- Replaces the custom data definition language with [JSON Schema][jsonschema] v4
  for describing database and model properties.
- Adds support for PostgreSQL arrays.  
  For example, for type `INTEGER[]` you get
  `{type: "array", items: {type: "integer"}}`.
- Adds support for the `integer` type.  
  `INTEGER` and similar column types are now returned as `integer`. JSON Schema
  supports that.

[jsonschema]: http://json-schema.org

## 1.1.0 (Dec 24, 2014)
- Adds [`Ddl.postgresqlSync`][] for getting the DDL synchronously.

[`Ddl.postgresqlSync`]: https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl.postgresqlSync

## 1.0.0 (May 30, 2014)
- Renamed from Attributes.js to DDL.js.
- Returns an instance of [`Ddl`][] from [`Ddl.sqlite3`][] and
  [`Ddl.postgresql`][] for future compatibility.

[`Ddl`]: https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl
[`Ddl.postgresql`]: https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl.postgresql
[`Ddl.sqlite3`]: https://github.com/moll/js-ddl/blob/master/doc/API.md#Ddl.sqlite3

## 0.1.337 (Oct 4, 2013)
- First release.  
  And the most overused cheesy word award of this year goes to: automagic.
