package frontend

import (
	"embed"
)

// FS is the embedded frontend assets
//
//go:embed dist/*
var FS embed.FS
