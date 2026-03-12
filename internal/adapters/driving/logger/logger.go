package logger

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// TUIWriter routes logs to different TUI windows based on severity.
type TUIWriter struct {
	TopWindow    io.Writer // For Errors
	BottomWindow io.Writer // For Info/Debug
}

func (t *TUIWriter) WriteLevel(level zerolog.Level, p []byte) (n int, err error) {
	// 1. Manually unescape \n and \t before writing to the TUI
	// Zerolog JSON output escapes these as literal characters
	unescaped := bytes.ReplaceAll(p, []byte("\\n"), []byte("\n"))
	unescaped = bytes.ReplaceAll(unescaped, []byte("\\t"), []byte("\t"))

	// 2. Route based on severity
	if level >= zerolog.ErrorLevel {
		return t.TopWindow.Write(unescaped)
	}
	return t.BottomWindow.Write(unescaped)
}

// Standard Write method for compatibility
func (t *TUIWriter) Write(p []byte) (n int, err error) {
	return t.BottomWindow.Write(p)
}

// Init initializes the global logger.
// If debug is true, it uses pretty console output for development.
// Otherwise, it uses JSON output for production.
func Init(debug bool) {
	if debug {
		// Pretty console output for development
		output := zerolog.ConsoleWriter{
			Out:        os.Stdout,
			NoColor:    true,
			TimeFormat: time.Kitchen,
			// This allows \n and \t to be interpreted by the terminal
			FormatMessage: func(i interface{}) string {
				return fmt.Sprintf("%s", i)
			},
		}
		log.Logger = log.Output(output).Level(zerolog.DebugLevel)
	} else {
		// JSON output for production
		log.Logger = log.Output(os.Stdout).
			Level(zerolog.InfoLevel)
	}
}

// InitTUI initializes the global logger with a TUI-specific writer.
func InitTUI(writer *TUIWriter) {
	log.Logger = zerolog.New(writer).
		With().
		Timestamp().
		Logger().
		Level(zerolog.DebugLevel)
}

// GetLogger returns the global logger.
func GetLogger() zerolog.Logger {
	return log.Logger
}

// SetLogLevel sets the global log level.
func SetLogLevel(level string) {
	switch strings.ToUpper(level) {
	case "DEBUG":
		log.Logger = log.Logger.Level(zerolog.DebugLevel)
	case "INFO":
		log.Logger = log.Logger.Level(zerolog.InfoLevel)
	case "WARN":
		log.Logger = log.Logger.Level(zerolog.WarnLevel)
	case "ERROR":
		log.Logger = log.Logger.Level(zerolog.ErrorLevel)
	case "FATAL":
		log.Logger = log.Logger.Level(zerolog.FatalLevel)
	default:
		log.Logger = log.Logger.Level(zerolog.InfoLevel)
	}
}
