package cache

import (
	"cache/internal/film"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type redisCache struct {
	host    string
	db      int
	expires time.Duration
}

func NewRedisCache(host string, db int, exp time.Duration) IPostCache {
	return &redisCache{
		host:    host,
		db:      db,
		expires: exp,
	}
}

func (cache *redisCache) getClient() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     cache.host,
		Password: "",
		DB:       cache.db,
	})
}

func (cache *redisCache) Set(key string, value *film.FilmResponse) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	json, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal user: %v", err)
		return
	}

	client.Set(ctx, key, string(json), cache.expires*time.Second)
}

func (cache *redisCache) Get(key string) *film.FilmResponse {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	val, err := client.Get(ctx, key).Result()
	if err != nil {
		return nil
	}

	user := film.FilmResponse{}

	err = json.Unmarshal([]byte(val), &user)
	if err != nil {
		log.Printf("failed to unmarshall user: %v", err)
	}

	return &user
}

func (cache *redisCache) GetAll() []*film.FilmResponse {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	var point uint64
	var users []*film.FilmResponse

	for {
		keys, nextPoint, err := client.Scan(ctx, point, "film:*", 100).Result()
		if err != nil {
			log.Printf("failed to scan keys from redis: %v", err)
			break
		}

		for _, key := range keys {
			val, err := client.Get(ctx, key).Result()
			if err != nil {
				log.Printf("failed to get value for key %s: %v", key, err)
				continue
			}

			var u film.FilmResponse
			if err := json.Unmarshal([]byte(val), &u); err != nil {
				log.Printf("failed to unmarshal user from key %s: %v", key, err)
				continue
			}

			users = append(users, &u)
		}

		if nextPoint == 0 {
			break
		}
		point = nextPoint
	}

	return users

}

func (cache *redisCache) Delete(key string) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	_, err := client.Del(ctx, key).Result()
	if err != nil {
		log.Printf("failed to delete key %s: %v", key, err)
	}
}

func (cache *redisCache) SetStaff(key string, value []*film.Actor) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	json, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal user: %v", err)
		return
	}

	client.Set(ctx, key, string(json), cache.expires*time.Second)
}

func (cache *redisCache) GetByStaffId(id string) []*film.Actor {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()
	key := "staff:" + id

	val, err := client.Get(ctx, key).Result()
	if err != nil {
		log.Printf("failed to get value for key %s: %v", key, err)
		return nil
	}

	var actors []*film.Actor
	if err := json.Unmarshal([]byte(val), &actors); err != nil {
		log.Printf("failed to unmarshal actors from key %s: %v", key, err)
		return nil
	}

	return actors
}

func (cache *redisCache) GetPopularFilms() *film.FilmListResponse {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()
	key := "popular"

	val, err := client.Get(ctx, key).Result()
	if err == redis.Nil {
		log.Printf("value for key %s not found", key)
		return nil
	} else if err != nil {
		log.Printf("failed to get value for key %s: %v", key, err)
		return nil
	}

	var films film.FilmListResponse
	if err := json.Unmarshal([]byte(val), &films); err != nil {
		log.Printf("failed to unmarshal films from key %s: %v", key, err)
		return nil
	}

	return &films
}

func (cache *redisCache) SetPopularFilms(key string, value *film.FilmListResponse) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	client := cache.getClient()

	json, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal user: %v", err)
		return
	}

	client.Set(ctx, key, string(json), cache.expires*time.Second)
}
