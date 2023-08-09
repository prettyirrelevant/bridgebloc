LINT_PATHS = bridgebloc/ manage.py

include .env.dev

lint:
	isort $(LINT_PATHS) --diff --check-only
	ruff $(LINT_PATHS)
	pylint $(LINT_PATHS)
	mypy $(LINT_PATHS) --install-types --non-interactive

format:
	isort $(LINT_PATHS)
	ruff $(LINT_PATHS) --fix
	black $(LINT_PATHS)

test:
	@echo "Running tests..."
	pytest --cov -s --cov-report xml:.coverage.xml

runserver:
	@echo 'Running blockthrift development server...'
	python -X dev manage.py runserver

start-huey:
	./manage.py run_huey -w 2 -f

generate-schema:
	./manage.py spectacular --color --file bridgebloc/docs/schema.yml

create-app:
	@mkdir bridgebloc/apps/$(filter-out $@,$(MAKECMDGOALS)) && python manage.py startapp $(filter-out $@,$(MAKECMDGOALS)) bridgebloc/apps/$(filter-out $@,$(MAKECMDGOALS))

%:
	@:
