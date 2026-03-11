package domain

type SchemaNode struct {
	Name     string       `json:"name"`
	Path     string       `json:"path"`
	IsDir    bool         `json:"isDir"`
	HasData  bool         `json:"hasData"`
	Children []SchemaNode `json:"children,omitempty"`
}

type MDXItem struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	FileName    string `json:"fileName"`
}

type ColumnInfo struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Description string `json:"description,omitempty"`
}

type TableDetail struct {
	Name        string       `json:"name"`
	Type        string       `json:"type"`
	Description string       `json:"description,omitempty"`
	Columns     []ColumnInfo `json:"columns"`
	Indexes     int          `json:"indexes"`
	Constraints int          `json:"constraints"`
}

type RelationDetail struct {
	Table         string   `json:"table"`
	Columns       []string `json:"columns"`
	ParentTable   string   `json:"parentTable"`
	ParentColumns []string `json:"parentColumns"`
	Definition    string   `json:"def"`
}

type SchemaStats struct {
	Tables      int              `json:"tables"`
	TableDetail []TableDetail    `json:"tableDetail"`
	Relations   []RelationDetail `json:"relations"`
}

type CollectionDetail struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Emoji       string   `json:"emoji"`
	Description string   `json:"description"`
	Tables      []string `json:"tables"`
}

type CollectionStats struct {
	Count int `json:"count"`
}

type ValidationResult struct {
	Valid  bool     `json:"valid"`
	Errors []string `json:"errors"`
}

type SchemaDashboard struct {
	Name            string             `json:"name"`
	ContentPath     string             `json:"contentPath"`
	DataPath        string             `json:"dataPath"`
	HasSchema       bool               `json:"hasSchema"`
	HasCollections  bool               `json:"hasCollections"`
	SchemaStats     *SchemaStats       `json:"schemaStats,omitempty"`
	CollectionStats *CollectionStats   `json:"collectionStats,omitempty"`
	Collections     []CollectionDetail `json:"collections,omitempty"`
	Validation      *ValidationResult  `json:"validation,omitempty"`
}

type BlueprintSchema struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Desc      string `json:"desc"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
