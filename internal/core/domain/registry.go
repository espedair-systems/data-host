package domain

// @Description Schema node for tree structure
type SchemaNode struct {
	Name     string       `json:"name" example:"finance"`
	Path     string       `json:"path" example:"/finance"`
	IsDir    bool         `json:"isDir" example:"true"`
	HasData  bool         `json:"hasData" example:"false"`
	Children []SchemaNode `json:"children,omitempty"`
}

// @Description MDX Content Item
type MDXItem struct {
	Title       string `json:"title" example:"Quick Start"`
	Description string `json:"description" example:"Getting started with finance module"`
	FileName    string `json:"fileName" example:"index.mdx"`
}

// @Description Column information
type ColumnInfo struct {
	Name        string `json:"name" example:"balance"`
	Type        string `json:"type" example:"float"`
	Description string `json:"description,omitempty" example:"Account balance"`
}

// @Description Table detail information
type TableDetail struct {
	Name        string       `json:"name" example:"accounts"`
	Type        string       `json:"type" example:"TABLE"`
	Description string       `json:"description,omitempty" example:"List of bank accounts"`
	Columns     []ColumnInfo `json:"columns"`
	Indexes     int          `json:"indexes" example:"2"`
	Constraints int          `json:"constraints" example:"1"`
}

// @Description Relation information between tables
type RelationDetail struct {
	Table         string   `json:"table" example:"transactions"`
	Columns       []string `json:"columns" example:"[\"account_id\"]"`
	ParentTable   string   `json:"parentTable" example:"accounts"`
	ParentColumns []string `json:"parentColumns" example:"[\"id\"]"`
	Definition    string   `json:"def" example:"FOREIGN KEY (account_id) REFERENCES accounts(id)"`
}

// @Description Schema statistics
type SchemaStats struct {
	Tables      int              `json:"tables" example:"5"`
	TableDetail []TableDetail    `json:"tableDetail"`
	Relations   []RelationDetail `json:"relations"`
}

// @Description Content collection detail
type CollectionDetail struct {
	ID          string   `json:"id" example:"coll_001"`
	Title       string   `json:"title" example:"Financial Reports"`
	Emoji       string   `json:"emoji" example:"💰"`
	Description string   `json:"description" example:"End of year reports"`
	Tables      []string `json:"tables" example:"[\"reports\", \"ledgers\"]"`
}

// @Description Collection statistics
type CollectionStats struct {
	Count int `json:"count" example:"12"`
}

// @Description Result of a validation check
type ValidationResult struct {
	Valid  bool     `json:"valid" example:"true"`
	Errors []string `json:"errors"`
}

// @Description Aggregated dashboard for a schema module
type SchemaDashboard struct {
	Name            string             `json:"name" example:"finance"`
	ContentPath     string             `json:"contentPath" example:"/content/finance"`
	DataPath        string             `json:"dataPath" example:"/data/finance"`
	HasSchema       bool               `json:"hasSchema" example:"true"`
	HasCollections  bool               `json:"hasCollections" example:"false"`
	SchemaStats     *SchemaStats       `json:"schemaStats,omitempty"`
	CollectionStats *CollectionStats   `json:"collectionStats,omitempty"`
	Collections     []CollectionDetail `json:"collections,omitempty"`
	Validation      *ValidationResult  `json:"validation,omitempty"`
}

// @Description Blueprint schema record
type BlueprintSchema struct {
	ID        int64  `json:"id" example:"1"`
	Name      string `json:"name" example:"Standard Accounting"`
	Desc      string `json:"desc" example:"Base schema for accounting modules"`
	CreatedAt string `json:"createdAt" example:"2026-03-12T00:00:00Z"`
	UpdatedAt string `json:"updatedAt" example:"2026-03-12T00:00:00Z"`
}

// @Description asset in the published data directory
type PublishedAsset struct {
	Name           string   `json:"name" example:"odoo"`
	HasSchema      bool     `json:"hasSchema" example:"true"`
	HasCollections bool     `json:"hasCollections" example:"false"`
	SchemaPath     string   `json:"schemaPath"`
	CollectionPath string   `json:"collectionPath"`
	LastModified   string   `json:"lastModified"`
	InDatabase     bool     `json:"inDatabase"`
	IsValid        bool     `json:"isValid"`
	TableCount     int      `json:"tableCount"`
	RelationCount  int      `json:"relationCount"`
	ValidationErr  []string `json:"validationErrors,omitempty"`
}
