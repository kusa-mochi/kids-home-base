package datastructures

type Config struct {
	JWTSecretKey string `json:"jwt_secret_key"`
	Salt         string `json:"salt"`
}
