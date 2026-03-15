package domain

// LoginRequest defines the credentials for authentication
// @Description Login payload
type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"admin123"`
}

// UpdateTableRequest defines the input for updating a table schema.
// @Description Table update payload
type UpdateTableRequest struct {
	ModuleName  string         `json:"module_name" validate:"required,max=100" binding:"required,max=100" example:"finance"`
	TableName   string         `json:"table_name" validate:"required,max=255" binding:"required,max=255" example:"transactions"`
	Description string         `json:"description" validate:"max=1000" binding:"max=1000" example:"Financial transaction records"`
	Columns     []ColumnDetail `json:"columns" validate:"required,min=1,max=500,dive" binding:"required,min=1,max=500,dive"`
}

// ColumnDetail defines the column information in UpdateTableRequest.
// @Description Column detail
type ColumnDetail struct {
	Name string `json:"name" validate:"required,max=100" binding:"required,max=100" example:"amount"`
	Type string `json:"type" validate:"required,oneof=string int float bool" binding:"required,oneof=string int float bool" example:"float"`
}

// GuidelineSelectionRequest defines the input for updating guideline selection.
// @Description Guideline selection update
type GuidelineSelectionRequest struct {
	Selection interface{} `json:"selection" validate:"required" binding:"required"`
}

// TrainingSelectionRequest defines the input for updating training selection.
// @Description Training selection update
type TrainingSelectionRequest struct {
	Selection interface{} `json:"selection" validate:"required" binding:"required"`
}

// @Description Standardized error response
type ErrorResponse struct {
	Error   string   `json:"error" example:"Internal Server Error"`
	Message string   `json:"message" example:"An unexpected error occurred"`
	Details []string `json:"details,omitempty"`
	Code    int      `json:"code" example:"500"`
}
