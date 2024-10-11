LINT_PATHS = bridgebloc/ manage.py

include .env.dev

lint:
	uv run isort $(LINT_PATHS) --diff --check-only
	uv run ruff $(LINT_PATHS)
	uv run pylint $(LINT_PATHS)
	uv run mypy $(LINT_PATHS) --install-types --non-interactive

format:
	uv run isort $(LINT_PATHS)
	uv run ruff $(LINT_PATHS) --fix
	uv run black $(LINT_PATHS)

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
