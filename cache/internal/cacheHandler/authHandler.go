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
	"strings"
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
		req.Header.Set("X-API-KEY", h.Config.ApiKey.ApiKey)
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

//////////////

func (h *cacheHandler) FetchCachesBulk() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		idsParam := r.URL.Query().Get("ids")
		if idsParam == "" {
			http.Error(w, "ids param required", http.StatusBadRequest)
			return
		}

		idStrs := strings.Split(idsParam, ",")
		if len(idStrs) == 0 {
			http.Error(w, "ids param empty", http.StatusBadRequest)
			return
		}

		keys := make([]string, 0, len(idStrs))
		idInts := make([]int, 0, len(idStrs))
		for _, idStr := range idStrs {
			id, err := strconv.Atoi(strings.TrimSpace(idStr))
			if err != nil {
				continue // пропускаем невалидные ID
			}
			idInts = append(idInts, id)
			keys = append(keys, fmt.Sprintf("film:%d", id))
		}

		// Получаем сразу все из кеша через MGET
		filmsFromCache, err := h.Cache.GetMultiple(keys)
		if err != nil {
			http.Error(w, "failed to get from cache", http.StatusInternalServerError)
			return
		}

		// Найдем ID для которых в кеше nil
		missingIDs := make([]int, 0)
		for i, film := range filmsFromCache {
			if film == nil {
				missingIDs = append(missingIDs, idInts[i])
			}
		}

		// Параллельно загружаем недостающие фильмы из API
		type result struct {
			film *film.FilmResponse
			err  error
		}

		concurrency := 10 // можно подстроить под сервер
		sem := make(chan struct{}, concurrency)
		resultsCh := make(chan result, len(missingIDs))

		for _, id := range missingIDs {
			sem <- struct{}{}
			go func(id int) {
				defer func() { <-sem }()
				f, err := h.fetchFilmFromAPI(id)
				resultsCh <- result{film: f, err: err}
			}(id)
		}

		// Собираем результаты
		for i := 0; i < len(missingIDs); i++ {
			res := <-resultsCh
			if res.err == nil && res.film != nil {
				// Кладем в кеш
				key := fmt.Sprintf("film:%d", res.film.KinopoiskID)
				h.Cache.Set(key, res.film)
				// Добавляем в общий слайс
				filmsFromCache = append(filmsFromCache, res.film)
			}
		}

		close(resultsCh)
		close(sem)

		response.Json(w, filmsFromCache, http.StatusOK)
		log.Printf("Time Duration (bulk): %s", time.Since(start))
	}
}

// вынесем вызов API в отдельную функцию
func (h *cacheHandler) fetchFilmFromAPI(id int) (*film.FilmResponse, error) {
	url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v2.2/films/%d", id)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-API-KEY", h.Config.ApiKey.ApiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("api status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var f film.FilmResponse
	if err := json.Unmarshal(body, &f); err != nil {
		return nil, err
	}

	return &f, nil
}
