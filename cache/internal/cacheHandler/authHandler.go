package cacheHandler

import (
	"cache/configs"
	"cache/internal/cache"
	"cache/internal/film"
	"cache/pkg/response"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"
)

type cacheHandler struct {
	Cache  cache.IPostCache
	Config *configs.Config
}


func NewCacheHandler(router *http.ServeMux, cacheRepo cache.IPostCache, Config *configs.Config) {
	handler := &cacheHandler{
		Cache:  cacheRepo,
		Config: Config,
	}

	router.Handle("GET /api/get-cache/{id}", handler.FetchCache())
	router.Handle("GET /api/get-staff/{id}", handler.FetchStaff())
}

func (h *cacheHandler) FetchCache() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		idStr := r.PathValue("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "invalid ID", http.StatusBadRequest)
			return
		}

		cacheKey := fmt.Sprintf("film:%d", id)
		cached := h.Cache.Get(cacheKey)
		if cached != nil && cached.KinopoiskID == id {
			response.Json(w, cached, http.StatusOK)
			log.Printf("Time Duration (cache): %s", time.Since(start))
			return
		}

		url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v2.2/films/%d", id)
		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("X-API-KEY", "48e848a4-1bc2-4ed7-9d15-d05f950d3f4f")
		req.Header.Set("Content-Type", "application/json")

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if resp.StatusCode != http.StatusOK {
			http.Error(w, string(body), resp.StatusCode)
			return
		}

		var film film.FilmResponse
		if err := json.Unmarshal(body, &film); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		h.Cache.Set(cacheKey, &film)

		response.Json(w, &film, http.StatusOK)
		log.Printf("Time Duration (api): %s", time.Since(start))
	}
}

func (h *cacheHandler) FetchStaff() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil {
			http.Error(w, "invalid ID", http.StatusBadRequest)
			return
		}

		idStrrr := strconv.Itoa(id)
		idStrr := "staff:" + strconv.Itoa(id)

		filmStuff := h.Cache.GetByStaffId(idStrrr)

		if len(filmStuff) == 0 {
			log.Println("GET API VALUE")
			url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=%d", id)

			client := &http.Client{
				Timeout: 10 * time.Second,
			}

			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			req.Header.Set("X-API-KEY", h.Config.ApiKey.ApiKey)
			req.Header.Set("Content-Type", "application/json")

			resp, err := client.Do(req)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if resp.StatusCode != http.StatusOK {
				http.Error(w, string(body), resp.StatusCode)
				return
			}

			var films []*film.Actor

			err = json.Unmarshal(body, &films)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}

			h.Cache.SetStaff(idStrr, films)

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(body)

			duration := time.Since(start)
			log.Printf("Time Duration: %s", duration)

			return
		} else {
			log.Println("GET REDIS VALUE")

			response.Json(w, filmStuff, http.StatusOK)

			duration := time.Since(start)
			log.Printf("Time Duration: %s", duration)

			return
		}

	}
}
