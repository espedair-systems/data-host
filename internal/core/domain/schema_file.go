package domain

type FileSchema struct {
	Name      string         `json:"name"`
	Desc      string         `json:"desc"`
	Tables    []FileTable    `json:"tables"`
	Relations []FileRelation `json:"relations"`
}

type FileTable struct {
	Name        string           `json:"name"`
	Type        string           `json:"type"`
	Comment     string           `json:"comment"`
	Def         string           `json:"def"`
	Columns     []FileColumn     `json:"columns"`
	Indexes     []FileIndex      `json:"indexes"`
	Constraints []FileConstraint `json:"constraints"`
	Labels      []FileLabel      `json:"labels,omitempty"`
}

type FileColumn struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Nullable bool   `json:"nullable"`
	Default  string `json:"default"`
	Comment  string `json:"comment"`
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
	ReferencedTable   string   `json:"referenced_table"`
	Columns           []string `json:"columns"`
	ReferencedColumns []string `json:"referenced_columns"`
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
}

type FileLabel struct {
	Name    string `json:"name"`
	Virtual bool   `json:"virtual"`
}
