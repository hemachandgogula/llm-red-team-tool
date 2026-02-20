.PHONY: install dev migrate upgrade test lint format

install:
	poetry install

dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	alembic revision --autogenerate -m "$(msg)"

upgrade:
	alembic upgrade head

downgrade:
	alembic downgrade -1

test:
	pytest tests/ -v --cov=app --cov-report=term-missing

lint:
	ruff check app/ tests/
	mypy app/

format:
	black app/ tests/
	ruff check --fix app/ tests/

docker-up:
	docker compose up -d postgres redis

docker-down:
	docker compose down
