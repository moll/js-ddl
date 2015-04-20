SELECT
	columns.column_name AS name,
	columns.data_type AS type,
	columns.udt_name::regtype AS udt,
	columns.column_default AS default,
	columns.is_nullable::boolean AS nullable,
	columns.character_maximum_length AS length,
	attributes.attndims AS dimensions

FROM information_schema.columns AS columns

JOIN pg_catalog.pg_attribute AS attributes
ON attributes.attrelid = columns.table_name::regclass
AND attributes.attname = columns.column_name
AND NOT attributes.attisdropped

WHERE columns.table_schema = 'public'
AND columns.table_name = $1

ORDER BY ordinal_position
