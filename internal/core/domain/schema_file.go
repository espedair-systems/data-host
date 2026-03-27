/*
 * Domain Layer: Core business models and logic.
 * This layer is independent of any external frameworks or infrastructure.
 */
package domain

type FileSchema struct {
	Name          string          `json:"name"`
	FileName      string          `json:"fileName,omitempty"`
	Desc          string          `json:"desc"`
	Tables        []FileTable     `json:"tables"`
	Relations     []FileRelation  `json:"relations"`
	Functions     []FileFunction  `json:"functions"`
	Enums         []FileEnum      `json:"enums"`
	Driver        *FileDriver     `json:"driver"`
	Labels        []FileLabel     `json:"labels,omitempty"`
	Viewpoints    []FileViewpoint `json:"viewpoints"`
	ERDLimit      int             `json:"erd_limit,omitempty"`
	ServiceConfig interface{}     `json:"service_config,omitempty"`
}

type FileTable struct {
	Name             string           `json:"name"`
	Type             string           `json:"type"`
	Comment          string           `json:"comment"`
	Def              string           `json:"def"`
	Columns          []FileColumn     `json:"columns"`
	Indexes          []FileIndex      `json:"indexes"`
	Constraints      []FileConstraint `json:"constraints"`
	Triggers         []FileTrigger    `json:"triggers"`
	Labels           []FileLabel      `json:"labels,omitempty"`
	ReferencedTables []string         `json:"referenced_tables,omitempty"`
}

type FileColumn struct {
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Nullable bool        `json:"nullable"`
	Default  interface{} `json:"default"`
	Comment  string      `json:"comment"`
	ExtraDef string      `json:"extra_def,omitempty"`
	Tags     []string    `json:"tags,omitempty"`
	Labels   []FileLabel `json:"labels,omitempty"`
}

type FileIndex struct {
	Name    string   `json:"name"`
	Def     string   `json:"def"`
	Table   string   `json:"table"`
	Columns []string `json:"columns"`
	Comment string   `json:"comment"`
}

type FileConstraint struct {
	Name              string   `json:"name"`
	Type              string   `json:"type"`
	Def               string   `json:"def"`
	Table             string   `json:"table"`
	ReferencedTable   string   `json:"referenced_table,omitempty"`
	Columns           []string `json:"columns"`
	ReferencedColumns []string `json:"referenced_columns,omitempty"`
	Comment           string   `json:"comment"`
}

type FileRelation struct {
	Table             string   `json:"table"`
	Columns           []string `json:"columns"`
	Cardinality       string   `json:"cardinality"`
	ParentTable       string   `json:"parent_table"`
	ParentColumns     []string `json:"parent_columns"`
	ParentCardinality string   `json:"parent_cardinality"`
	Def               string   `json:"def"`
	Virtual           bool     `json:"virtual"`
	Type              string   `json:"type,omitempty"`
}

type FileTrigger struct {
	Name    string `json:"name"`
	Def     string `json:"def"`
	Comment string `json:"comment"`
}

type FileFunction struct {
	Name       string `json:"name"`
	ReturnType string `json:"return_type"`
	Arguments  string `json:"arguments"`
	Type       string `json:"type"`
}

type FileEnum struct {
	Name   string   `json:"name"`
	Values []string `json:"values"`
}

type FileDriver struct {
	Name            string      `json:"name"`
	DatabaseVersion string      `json:"database_version"`
	Meta            *DriverMeta `json:"meta"`
}

type DriverMeta struct {
	CurrentSchema string            `json:"current_schema"`
	SearchPaths   []string          `json:"search_paths"`
	Dict          map[string]string `json:"dict"`
}

type FileLabel struct {
	Name    string `json:"name"`
	Virtual bool   `json:"virtual"`
}

type FileViewpoint struct {
	Name     string           `json:"name"`
	Desc     string           `json:"desc"`
	Labels   []string         `json:"labels,omitempty"`
	Tables   []string         `json:"tables,omitempty"`
	Distance int              `json:"distance"`
	Groups   []ViewpointGroup `json:"groups,omitempty"`
}

type ViewpointGroup struct {
	Name   string   `json:"name"`
	Desc   string   `json:"desc"`
	Labels []string `json:"labels,omitempty"`
	Tables []string `json:"tables,omitempty"`
	Color  string   `json:"color"`
}
