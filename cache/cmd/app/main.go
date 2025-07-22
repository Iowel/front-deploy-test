package main

import (
	"cache/configs"
	cacheHandler "cache/internal/cacheHandler"
	"cache/internal/cache"
	"cache/pkg/middleware"
	"log"
	"net/http"
	"time"
)

const (
	redisDB = 1
	exp     = 9999999999999
)

func main() {
	conf := configs.LoadConfig()

	router := http.NewServeMux()

	cacheRepo := cache.NewRedisCache(conf.Redis.Port, redisDB, exp)

	// Handlers
	cacheHandler.NewCacheHandler(router, cacheRepo, conf)

	// Middlewares
	stack := middleware.Chain(
		middleware.CORS,
	)

	// Server
	server := http.Server{
		Addr:         conf.Web.Port,
		Handler:      stack(router),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("Starting HTTP server on port %s\n", conf.Web.Port)
	server.ListenAndServe()

}
