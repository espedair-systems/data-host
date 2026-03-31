package domain

type Taxonomy struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Version      string `json:"version"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	TaxonomyType string `json:"taxonomy_type"`
	Source       string `json:"source"`
	Language     string `json:"default_language"`
	GeneratedAt  string `json:"generated_at_utc"`
}

type TaxonomyTerm struct {
	ID             int64          `json:"id"`
	TaxonomyID     int64          `json:"taxonomy_id"`
	TermID         string         `json:"term_id"`
	Label          string         `json:"label"`
	Definition     string         `json:"definition"`
	Status         string         `json:"status"`
	TermType       string         `json:"term_type"`
	Language       string         `json:"language"`
	ParentTermID   string         `json:"parent_term_id"`
	Classification string         `json:"classification"`
	Owner          string         `json:"owner"`
	Steward        string         `json:"steward"`
	Children       []TaxonomyTerm `json:"children,omitempty"`
}
