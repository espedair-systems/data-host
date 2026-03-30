package domain

import "time"

// BusinessGlossary represents the metadata of a glossary
type BusinessGlossary struct {
	ID                int64     `json:"id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	SourceFile        string    `json:"source_file"`
	GeneratedAtUTC    string    `json:"generated_at_utc"`
	OriginalRows      int       `json:"original_rows"`
	UniqueTerms       int       `json:"unique_terms"`
	DuplicatesRemoved int       `json:"duplicates_removed"`
	CreatedAt         time.Time `json:"created_at"`
}

// GlossaryTerm represents a single entry in the business glossary
type GlossaryTerm struct {
	AssetID            string               `json:"asset_id"`
	GlossaryID         int64                `json:"glossary_id"`
	FullName           string               `json:"full_name"`
	Name               string               `json:"name"`
	Definition         string               `json:"definition"`
	Status             string               `json:"status"`
	Domain             string               `json:"domain"`
	Community          string               `json:"community"`
	DomainType         string               `json:"domain_type"`
	DomainID           string               `json:"domain_id"`
	AssetType          string               `json:"asset_type"`
	SourceSheet        string               `json:"source_sheet"`
	RelatedDataDomains []RelatedDataDomain  `json:"related_data_domains"`
	CreatedAt          time.Time            `json:"created_at"`
}

// RelatedDataDomain represents a relationship between a term and another domain
type RelatedDataDomain struct {
	ID                  int64     `json:"id"`
	TermAssetID         string    `json:"term_asset_id"`
	RelatesToName       string    `json:"relates_to_name"`
	RelatesToFullName   string    `json:"relates_to_full_name"`
	RelatesToAssetType  string    `json:"relates_to_asset_type"`
	RelatesToCommunity  string    `json:"relates_to_community"`
	RelatesToDomainType string    `json:"relates_to_domain_type"`
	RelatesToDomain     string    `json:"relates_to_domain"`
	RelatesToDomainID   string    `json:"relates_to_domain_id"`
	RelatesToAssetID    string    `json:"relates_to_asset_id"`
	CreatedAt           time.Time `json:"created_at"`
}
