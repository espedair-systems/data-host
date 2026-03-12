#!/bin/bash
set -e

echo "🚀 Starting DataHost API Test Suite"
echo "==================================="

# 1. Run Unit Tests
echo "🧪 Running Unit Tests..."
go test -v -short ./...

# 2. Run All Tests with Race Detection
echo "🧪 Running Performance & Race Detection Tests..."
go test -v -race -timeout 30s ./...

# 3. Coverage Analysis
echo "📊 Generating Coverage Report..."
go test -coverprofile=coverage.out ./...
coverage=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
echo "✅ Total Coverage: $coverage"

# threshold Check
threshold="70%" # Settling for 70% as initial target for Phase 1
if [[ "${coverage% %}" < "${threshold% %}" ]]; then
    echo "⚠️  Warning: Coverage $coverage is below threshold $threshold"
fi

echo "✨ All tests passed!"
