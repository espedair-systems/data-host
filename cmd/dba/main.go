package main

import (
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/core/domain"
	"data-host/internal/database"
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func main() {
	var schemaFile string
	var dbURL string

	var rootCmd = &cobra.Command{
		Use:   "dba",
		Short: "DBA administration tool",
	}

	var loadSchemaCmd = &cobra.Command{
		Use:   "load-schema",
		Short: "Load a schema.json file into the SQLite database",
		Run: func(cmd *cobra.Command, args []string) {
			if schemaFile == "" {
				fmt.Println("Error: --file is required")
				os.Exit(1)
			}

			// 1. Read and parse schema file
			data, err := os.ReadFile(schemaFile)
			if err != nil {
				fmt.Printf("Error reading file: %v\n", err)
				os.Exit(1)
			}

			var fs domain.FileSchema
			if err := json.Unmarshal(data, &fs); err != nil {
				fmt.Printf("Error parsing JSON: %v\n", err)
				os.Exit(1)
			}

			// 2. Setup database and repository
			db := database.New(dbURL)
			dbaRepo := repository.NewSQLiteDBARepository(db.GetDB())

			// 3. Load schema
			fmt.Printf("Loading schema '%s' into %s...\n", fs.Name, dbURL)
			if err := dbaRepo.LoadSchema(fs); err != nil {
				fmt.Printf("Error loading schema: %v\n", err)
				os.Exit(1)
			}

			fmt.Println("Schema loaded successfully!")
		},
	}

	loadSchemaCmd.Flags().StringVarP(&schemaFile, "file", "f", "", "Path to schema.json file")
	loadSchemaCmd.Flags().StringVarP(&dbURL, "database", "b", "blueprint.db", "Path to SQLite database")

	rootCmd.AddCommand(loadSchemaCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
