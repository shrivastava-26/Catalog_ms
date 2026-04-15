#!/bin/bash
set -e

APP_DIR="/var/www/catalog-service"
SERVICE_NAME="catalog-service"

cd "$APP_DIR"

npm ci --omit=dev
sudo systemctl daemon-reload
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager