package artifacts

import (
	"embed"
	"io/fs"
	"os"
	"path/filepath"
)

//go:embed database help projects schema swagger templates workflows
var Content embed.FS

// ExtractTo attempts to export all embedded files down to the destination dir.
func ExtractTo(destDir string) error {
	return fs.WalkDir(Content, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if path == "." {
			return nil
		}

		destPath := filepath.Join(destDir, path)

		if d.IsDir() {
			return os.MkdirAll(destPath, 0755)
		}

		// Don't overwrite existing if not forced, but here it's okay for README/examples if simple
		// Usually we check if it already exists to preserve user files across restarts
		if _, err := os.Stat(destPath); err == nil {
			return nil // Skip existing file
		}

		content, err := Content.ReadFile(path)
		if err != nil {
			return err
		}

		return os.WriteFile(destPath, content, 0644)
	})
}
