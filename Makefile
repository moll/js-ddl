NODE_OPTS = --harmony-generators
TEST_OPTS =

love:
	@echo "Feel like makin' love."

test:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R dot $(TEST_OPTS)

spec: 
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec $(TEST_OPTS)

autotest:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R dot --watch $(TEST_OPTS)

autospec:
	@node $(NODE_OPTS) ./node_modules/.bin/_mocha -R spec --watch $(TEST_OPTS)

pack:
	@file=$$(npm pack); echo "$$file"; tar tf "$$file"

publish:
	npm publish

tag:
	git tag "v$$(node -e 'console.log(require("./package").version)')"

# NOTE: Sorry, mocumentation is not yet published.
doc: tmp/doc.json
	@mkdir -p doc
	@~/Documents/Mocumentation/bin/mocument \
		--type yui \
		--title DDL.js \
		--priority Ddl \
		tmp/data.json > doc/API.md

toc: tmp/doc.json
	@~/Documents/Mocumentation/bin/mocument \
		--type yui \
		--template toc \
		--priority Ddl \
		--var api_url=https://github.com/moll/js-ddl/blob/master/doc/API.md \
		tmp/data.json > tmp/TOC.md

	echo "1{h;d;};1!{x;G;};/^### \[[[:alpha:]]+\]/,/^\\\n\$$/{/^\\\n\$$/{r tmp/TOC.md\n;a\\\\\n\\\\\n\n;};d;};\$$!P;\$$p;d" |\
		sed -i "" -E -f /dev/stdin README.md

tmp/doc.json:
	@mkdir -p tmp
	@yuidoc --exclude test,node_modules --parse-only --outdir tmp .

createdb:
	createdb -E utf8 -T template0 ddl_test

dropdb:
	dropdb ddl_test

clean:
	rm -rf tmp *.tgz
	npm prune --production

.PHONY: love
.PHONY: test spec autotest autospec
.PHONY: pack publish tag
.PHONY: createdb dropdb
.PHONY: clean
