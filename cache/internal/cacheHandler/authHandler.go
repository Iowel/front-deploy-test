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

	"golang.org/x/sync/singleflight"
)

type cacheHandler struct {
	Cache  cache.IPostCache
	Config *configs.Config
	group  singleflight.Group
}

func NewCacheHandler(router *http.ServeMux, cacheRepo cache.IPostCache, Config *configs.Config) {
	handler := &cacheHandler{
		Cache:  cacheRepo,
		Config: Config,
	}

	router.Handle("GET /api/get-cache/{id}", handler.FetchCache())
	// router.Handle("GET /api/get-caches", handler.FetchCachesBulk())
	router.Handle("GET /api/get-staff/{id}", handler.FetchStaff())
	router.Handle("GET /api/get-popular", handler.FetchNewFilms())
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
		if cached != nil {
			response.Json(w, cached, http.StatusOK)
			return
		}

		v, err, _ := h.group.Do(cacheKey, func() (interface{}, error) {
			// Этот код вызовется только ОДИН раз на ключ
			log.Printf("Calling API for ID %d", id)

			url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v2.2/films/%d", id)
			req, _ := http.NewRequest("GET", url, nil)
			req.Header.Set("X-API-KEY", h.Config.ApiKey.ApiKey)

			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return nil, err
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(resp.Body)
				return nil, fmt.Errorf("api error: %s", string(body))
			}

			body, _ := io.ReadAll(resp.Body)
			var film film.FilmResponse
			if err := json.Unmarshal(body, &film); err != nil {
				return nil, err
			}

			h.Cache.Set(cacheKey, &film)

			return &film, nil
		})

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		response.Json(w, v, http.StatusOK)

		log.Printf("Time Duration (api): %s", time.Since(start))
	}
}

func (h *cacheHandler) FetchNewFilms() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		cacheKey := "popular"

		if cached := h.Cache.GetPopularFilms(); cached != nil {
			resp := film.PremieresResponse{
				Total: len(cached),
				Docs:  cached,
			}
			response.Json(w, resp, http.StatusOK)
			return
		}

		var allFilms []*film.Popular
		page := 1

		for {
			url := fmt.Sprintf("https://api.kinopoisk.dev/v1.4/movie?premiere.russia=15.09.2025-30.12.2025&year=2025&limit=100&page=%d", page)
			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				http.Error(w, "failed to create request", http.StatusInternalServerError)
				return
			}
			req.Header.Set("x-api-key", h.Config.ApiKeyKinopoiskDev.Token)
			req.Header.Set("Content-Type", "application/json")

			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				body, _ := io.ReadAll(resp.Body)
				http.Error(w, fmt.Sprintf("api error: %s", string(body)), http.StatusInternalServerError)
				return
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				http.Error(w, "failed to read response body", http.StatusInternalServerError)
				return
			}

			var films film.PremieresResponse
			if err := json.Unmarshal(body, &films); err != nil {
				http.Error(w, "unmarshal error", http.StatusInternalServerError)
				return
			}

			allFilms = append(allFilms, films.Docs...)

			// Предполагается, что в film.PremieresResponse есть поле Pages int `json:"pages"`
			if page >= films.Pages || films.Pages == 0 {
				break
			}
			page++
		}

		h.Cache.SetPopularFilms(cacheKey, allFilms)

		response.Json(w, film.PremieresResponse{
			Total: len(allFilms),
			Docs:  allFilms,
		}, http.StatusOK)

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

//////////////

// func (h *cacheHandler) FetchCachesBulk() http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		start := time.Now()

// 		idsParam := r.URL.Query().Get("ids")
// 		if idsParam == "" {
// 			http.Error(w, "ids param required", http.StatusBadRequest)
// 			return
// 		}

// 		idStrs := strings.Split(idsParam, ",")
// 		if len(idStrs) == 0 {
// 			http.Error(w, "ids param empty", http.StatusBadRequest)
// 			return
// 		}

// 		keys := make([]string, 0, len(idStrs))
// 		idInts := make([]int, 0, len(idStrs))
// 		for _, idStr := range idStrs {
// 			id, err := strconv.Atoi(strings.TrimSpace(idStr))
// 			if err != nil {
// 				continue
// 			}
// 			idInts = append(idInts, id)
// 			keys = append(keys, fmt.Sprintf("film:%d", id))
// 		}

// 		filmsFromCache, err := h.Cache.GetMultiple(keys)
// 		if err != nil {
// 			http.Error(w, "failed to get from cache", http.StatusInternalServerError)
// 			return
// 		}

// 		missingIDs := make([]int, 0)
// 		for i, film := range filmsFromCache {
// 			if film == nil {
// 				missingIDs = append(missingIDs, idInts[i])
// 			}
// 		}

// 		type result struct {
// 			film *film.FilmResponse
// 			err  error
// 		}

// 		concurrency := 10
// 		sem := make(chan struct{}, concurrency)
// 		resultsCh := make(chan result, len(missingIDs))

// 		for _, id := range missingIDs {
// 			sem <- struct{}{}
// 			go func(id int) {
// 				defer func() { <-sem }()
// 				f, err := h.fetchFilmFromAPI(id)
// 				resultsCh <- result{film: f, err: err}
// 			}(id)
// 		}

// 		for i := 0; i < len(missingIDs); i++ {
// 			res := <-resultsCh
// 			if res.err == nil && res.film != nil {

// 				key := fmt.Sprintf("film:%d", res.film.KinopoiskID)
// 				h.Cache.Set(key, res.film)

// 				filmsFromCache = append(filmsFromCache, res.film)
// 			}
// 		}

// 		close(resultsCh)
// 		close(sem)

// 		response.Json(w, filmsFromCache, http.StatusOK)
// 		log.Printf("Time Duration (bulk): %s", time.Since(start))
// 	}
// }

// func (h *cacheHandler) fetchFilmFromAPI(id int) (*film.FilmResponse, error) {
// 	url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v2.2/films/%d", id)
// 	req, err := http.NewRequest("GET", url, nil)
// 	if err != nil {
// 		return nil, err
// 	}
// 	req.Header.Set("X-API-KEY", h.Config.ApiKey.ApiKey)
// 	req.Header.Set("Content-Type", "application/json")

// 	resp, err := http.DefaultClient.Do(req)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode != http.StatusOK {
// 		return nil, fmt.Errorf("api status: %d", resp.StatusCode)
// 	}

// 	body, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		return nil, err
// 	}

// 	var f film.FilmResponse
// 	if err := json.Unmarshal(body, &f); err != nil {
// 		return nil, err
// 	}

// 	return &f, nil
// }
