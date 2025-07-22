package cache

import (
	"cache/internal/film"
)

type IPostCache interface {
	Set(key string, value *film.FilmResponse)
	Get(key string) *film.FilmResponse
	GetAll() []*film.FilmResponse
	Delete(key string)

	SetStaff(key string, value []*film.Actor)

	GetByStaffId(key string) []*film.Actor



	GetPopularFilms() *film.FilmListResponse 
	SetPopularFilms(key string, value *film.FilmListResponse)
}
