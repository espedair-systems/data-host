package logger

import (
	"os"
	"strings"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Init initializes the global logger.
// If debug is true, it uses pretty console output for development.
// Otherwise, it uses JSON output for production.
func Init(debug bool) {
	if debug {
		// Pretty console output for development
		log.Logger = log.Output(
			zerolog.ConsoleWriter{
				Out:        os.Stderr,
				TimeFormat: "15:04:05",
			}).
			Level(zerolog.DebugLevel)
	} else {
		// JSON output for production
		log.Logger = log.Output(os.Stdout).
			Level(zerolog.InfoLevel)
	}
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
