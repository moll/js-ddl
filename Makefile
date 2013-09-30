NODE_OPTS :=
TEST_OPTS :=

love:
	@echo "Feel like makin' love."

test:
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R dot $(TEST_OPTS)

spec: 
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R spec $(TEST_OPTS)

autotest:
	@node $(NODE_OPTS) ./node_modules/.bin/mocha -R spec --watch $(TEST_OPTS)

pack:
	npm pack

publish:
	npm publish

clean:
	rm -rf tmp *.tgz

createdb:
	createdb -E utf8 -T template0 assertions_test

.PHONY: love test spec autotest
.PHONY: pack publish clean
.PHONY: createdb
