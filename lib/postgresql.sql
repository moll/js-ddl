SELECT
	attr.attname,
	format_type(attr.atttypid, attr.atttypmod) AS type,
	attr.atttypid,
	attr.atttypmod,
	attr.attnotnull,
	pg_get_expr(def.adbin, def.adrelid) AS default

FROM pg_catalog.pg_attribute AS attr
LEFT JOIN pg_catalog.pg_attrdef AS def
	ON attr.attrelid = def.adrelid
	AND attr.attnum = def.adnum

WHERE attr.attrelid = $1::regclass
	AND attr.attnum > 0
	AND NOT attr.attisdropped
	ORDER BY attr.attnum
