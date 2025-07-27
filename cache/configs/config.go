package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DB                 Dbconfig
	Auth               AuthConfig
	Web                WebConfig
	Redis              Redis
	ApiKey             ApiKey
	ApiKeyKinopoiskDev ApiKeyKinopoiskDev
}

type Dbconfig struct {
	Dsn string
}

type ApiKeyKinopoiskDev struct {
	Token string
}

type AuthConfig struct {
	Secret string
}

type WebConfig struct {
	Port string
	Api  string
	Dsn  string
	Env  string
}

type Redis struct {
	Port string
}

type ApiKey struct {
	ApiKey string
}

func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using default config")
	}

	return &Config{
		DB:                 Dbconfig{Dsn: os.Getenv("DB_DSN")},
		Auth:               AuthConfig{Secret: os.Getenv("SECRET")},
		Web:                WebConfig{Port: os.Getenv("PORT"), Api: os.Getenv("API"), Dsn: os.Getenv("DSN"), Env: os.Getenv("ENV")},
		Redis:              Redis{Port: os.Getenv("REDIS_PORT")},
		ApiKey:             ApiKey{ApiKey: os.Getenv("KINOPOISK_API_KEY")},
		ApiKeyKinopoiskDev: ApiKeyKinopoiskDev{Token: os.Getenv("KINOPOISK_DEV_API_KEY")},
	}
}
