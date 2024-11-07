# Makefile

.PHONY: test build run

# Run tests sequentially with verbose output
test:
	go test -count 1 -p 1 -v rul.sh/vaulterm/tests

# Build the Go application
build:
	go build -o myapp .

# Run the built application
run: build
	./myapp
