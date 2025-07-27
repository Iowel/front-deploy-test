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
	client  *redis.Client
	expires time.Duration
}

func NewRedisCache(host string, db int, exp time.Duration) IPostCache {
	client := redis.NewClient(&redis.Options{
		Addr:     host,
		Password: "",
		DB:       db,
	})

	return &redisCache{
		client:  client,
		expires: exp,
	}
}

func (cache *redisCache) Set(key string, value *film.FilmResponse) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	jsonBytes, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal film: %v", err)
		return
	}

	err = cache.client.Set(ctx, key, jsonBytes, cache.expires*time.Second).Err()
	if err != nil {
		log.Printf("failed to set key %s: %v", key, err)
	}
}

func (cache *redisCache) Get(key string) *film.FilmResponse {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	val, err := cache.client.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			log.Printf("failed to get key %s: %v", key, err)
		}
		return nil
	}

	var filmResp film.FilmResponse
	if err := json.Unmarshal([]byte(val), &filmResp); err != nil {
		log.Printf("failed to unmarshal film from key %s: %v", key, err)
		return nil
	}

	return &filmResp
}

func (cache *redisCache) GetAll() []*film.FilmResponse {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var cursor uint64
	var films []*film.FilmResponse

	for {
		keys, nextCursor, err := cache.client.Scan(ctx, cursor, "film:*", 100).Result()
		if err != nil {
			log.Printf("failed to scan keys: %v", err)
			break
		}

		for _, key := range keys {
			val, err := cache.client.Get(ctx, key).Result()
			if err != nil {
				log.Printf("failed to get key %s: %v", key, err)
				continue
			}

			var f film.FilmResponse
			if err := json.Unmarshal([]byte(val), &f); err != nil {
				log.Printf("failed to unmarshal film from key %s: %v", key, err)
				continue
			}

			films = append(films, &f)
		}

		if nextCursor == 0 {
			break
		}
		cursor = nextCursor
	}

	return films
}

func (cache *redisCache) Delete(key string) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := cache.client.Del(ctx, key).Err()
	if err != nil {
		log.Printf("failed to delete key %s: %v", key, err)
	}
}

func (cache *redisCache) SetStaff(key string, value []*film.Actor) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	jsonBytes, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal staff: %v", err)
		return
	}

	err = cache.client.Set(ctx, key, jsonBytes, cache.expires*time.Second).Err()
	if err != nil {
		log.Printf("failed to set staff key %s: %v", key, err)
	}
}

func (cache *redisCache) GetByStaffId(id string) []*film.Actor {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	key := "staff:" + id
	val, err := cache.client.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			log.Printf("failed to get staff key %s: %v", key, err)
		}
		return nil
	}

	var actors []*film.Actor
	if err := json.Unmarshal([]byte(val), &actors); err != nil {
		log.Printf("failed to unmarshal staff from key %s: %v", key, err)
		return nil
	}

	return actors
}

func (cache *redisCache) GetPopularFilms() []*film.Popular {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	key := "popular"
	val, err := cache.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			log.Printf("value for key %s not found", key)
		} else {
			log.Printf("failed to get popular films key %s: %v", key, err)
		}
		return nil
	}

	var films []*film.Popular
	if err := json.Unmarshal([]byte(val), &films); err != nil {
		log.Printf("failed to unmarshal popular films from key %s: %v", key, err)
		return nil
	}

	return films
}

func (cache *redisCache) SetPopularFilms(key string, value []*film.Popular) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	jsonBytes, err := json.Marshal(value)
	if err != nil {
		log.Printf("failed to marshal popular films: %v", err)
		return
	}

	err = cache.client.Set(ctx, key, jsonBytes, cache.expires*time.Second).Err()
	if err != nil {
		log.Printf("failed to set popular films key %s: %v", key, err)
	}
}

// func (cache *redisCache) GetMultiple(keys []string) ([]*film.FilmListResponse, error) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
// 	defer cancel()

// 	vals, err := cache.client.MGet(ctx, keys...).Result()
// 	if err != nil {
// 		return nil, err
// 	}

// 	films := make([]*film.FilmResponse, 0, len(vals))
// 	for _, val := range vals {
// 		if val == nil {
// 			films = append(films, nil)
// 			continue
// 		}

// 		strVal, ok := val.(string)
// 		if !ok {
// 			films = append(films, nil)
// 			continue
// 		}

// 		var f []*film.FilmListResponse
// 		if err := json.Unmarshal([]byte(strVal), &f); err != nil {
// 			films = append(films, nil)
// 			continue
// 		}

// 		films = append(films, f)
// 	}

// 	return films, nil
// }
