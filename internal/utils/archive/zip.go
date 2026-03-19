/**
 * @file: internal/utils/archive/zip.go
 * @purpose: Provides generic ZIP archive extraction utilities.
 * @business_rules: Implements security checks to prevent path traversal (ZipSlip).
 * @tech_stack: Go Standard Library (archive/zip, io, os, filepath).
 */

package archive

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

/*
Package archive - Utility functions for handling compressed files.

INTENT:
- Provide standard, secure methods for extracting archives.
- Centralize archive logic to keep adapters and services thin.

CONTEXT:
- Domain: Infrastructure Utility
- Security: Prevents "ZipSlip" by validating destination paths.
*/

// Unzip extracts a ZIP archive from src to dest.
func Unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	// Ensure destination directory exists
	if err := os.MkdirAll(dest, 0755); err != nil {
		return err
	}

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		// ZipSlip security check: ensure the file path is within the destination
		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("%s: illegal file path (potential ZipSlip)", fpath)
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			return err
		}

		_, err = io.Copy(outFile, rc)

		// Ensuring clean closure of files within the loop
		outFile.Close()
		rc.Close()

		if err != nil {
			return err
		}
	}
	return nil
}
