package main

import (
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/core/domain"
	"fmt"
	"os"
)

func main() {
	cfg := domain.HostConfig{
		Deploy:   "TEST",
		SitePath: "/home/jonk/projects/DATA_HOST/TEST/sites",
	}

	repo := repository.NewFilesystemRepository(cfg)
    
    // 1. Discover and enrich sites
    sites, err := repo.GetSites()
    if err != nil {
        fmt.Printf("Error getting sites: %v\n", err)
        os.Exit(1)
    }

    fmt.Printf("Found %d sites\n", len(sites))
    for _, s := range sites {
        fmt.Printf("- %s (DataPath: %s)\n", s.Name, s.DataPath)
    }

    // 2. Set discovered sites into a new repo config to simulate TUI boot
    newCfg := cfg
    newCfg.Sites = sites
    repo2 := repository.NewFilesystemRepository(newCfg)

	assets, err := repo2.GetPublishedAssets()
	if err != nil {
		fmt.Printf("Error getting assets: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Discovered %d assets\n", len(assets))
	for _, a := range assets {
		fmt.Printf("- %s (Schema: %v, Valid: %v)\n", a.Name, a.HasSchema, a.IsValid)
	}
}
