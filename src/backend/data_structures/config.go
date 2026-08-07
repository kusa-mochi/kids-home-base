package datastructures

type Config struct {
	InitialPasswordHash string `json:"initial_password_hash"`
	JWTSecretKey        string `json:"jwt_secret_key"`
	Salt                string `json:"salt"`
}
