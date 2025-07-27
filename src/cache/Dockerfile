# Stage 1: Build
FROM golang:1.24-alpine3.21 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download


COPY .env .env  
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o cache_service /app/cmd/app/main.go




# Stage 2: Run
FROM gcr.io/distroless/static:nonroot

WORKDIR /app

COPY --from=builder /app/cache_service .
COPY --from=builder /app/.env /app/.env  


EXPOSE 8888

ENTRYPOINT ["/app/cache_service"]
