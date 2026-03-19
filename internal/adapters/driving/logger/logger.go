/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package logger

import (
	"bytes"
	"data-host/internal/core/domain"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	stdLog "log"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gopkg.in/natefinch/lumberjack.v2"
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
func Init(config domain.HostConfig) {
	writers := getWriters(config)
	multi := io.MultiWriter(writers...)
	log.Logger = zerolog.New(multi).With().Timestamp().Logger()
	stdLog.SetOutput(multi)

	// Initial log level
	SetLogLevel(config.LogLevel)
}

// InitTUI initializes the global logger with a TUI-specific writer.
func InitTUI(config domain.HostConfig, writer *TUIWriter) {
	var writers []io.Writer

	// File logging with rotation (Always use if enabled, even in TUI)
	if config.LogFileEnabled && config.LogFilePath != "" {
		logDir := filepath.Dir(config.LogFilePath)
		if err := os.MkdirAll(logDir, 0755); err == nil {
			fileLogger := &lumberjack.Logger{
				Filename:   config.LogFilePath,
				MaxSize:    config.LogMaxSize,
				MaxBackups: config.LogMaxBackups,
				MaxAge:     config.LogMaxAge,
				Compress:   true,
			}
			writers = append(writers, fileLogger)
		}
	}

	// UI logging: Always add TUI writer in TUI mode
	writers = append(writers, writer)

	// NOTE: We do NOT use getWriters(config) here because we must avoid os.Stdout
	// in TUI mode to prevent display corruption.

	multi := io.MultiWriter(writers...)

	log.Logger = zerolog.New(multi).
		With().
		Timestamp().
		Logger().
		Level(zerolog.DebugLevel)

	stdLog.SetOutput(log.Logger)
}

func getWriters(config domain.HostConfig) []io.Writer {
	var writers []io.Writer

	if config.Debug {
		// Pretty console output for development
		writers = append(writers, zerolog.ConsoleWriter{
			Out:        os.Stdout,
			NoColor:    false,
			TimeFormat: time.Kitchen,
			FormatMessage: func(i interface{}) string {
				return fmt.Sprintf("%s", i)
			},
		})
	} else {
		// JSON output for production (Standard out)
		writers = append(writers, os.Stdout)
	}

	// File logging with rotation
	if config.LogFileEnabled && config.LogFilePath != "" {
		// Ensure directory exists
		logDir := filepath.Dir(config.LogFilePath)
		if err := os.MkdirAll(logDir, 0755); err == nil {
			fileLogger := &lumberjack.Logger{
				Filename:   config.LogFilePath,
				MaxSize:    config.LogMaxSize, // megabytes
				MaxBackups: config.LogMaxBackups,
				MaxAge:     config.LogMaxAge, // days
				Compress:   true,             // disabled by default
			}
			writers = append(writers, fileLogger)
		} else {
			fmt.Printf("Warning: could not create log directory %s: %v\n", logDir, err)
		}
	}

	return writers
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
