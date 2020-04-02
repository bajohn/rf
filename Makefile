SHELL:=/bin/bash

.PHONY: backend
backend:
	scripts/package_py.sh;
	scripts/deploy_py.sh;
	cd terraform && terraform apply;

.PHONY: frontend
frontend:
	cd frontend && ng build;
	pipenv run python scripts/deploy_frontend.py;

.PHONY: local
local:
	cd frontend && ng serve;