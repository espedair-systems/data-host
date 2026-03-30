package domain

import "time"

// ReferenceDataPackage represents a complete reference data management artifact
type ReferenceDataPackage struct {
	ID             int64                 `json:"id"`
	Name           string                `json:"name"`
	Version        string                `json:"version"`
	Description    string                `json:"description,omitempty"`
	Domain         string                `json:"domain"`
	Source         string                `json:"source,omitempty"`
	GeneratedAtUTC string                `json:"generated_at_utc,omitempty"`
	CreatedAtUTC   time.Time             `json:"created_at_utc"`
	UpdatedAtUTC   *time.Time            `json:"updated_at_utc,omitempty"`
	Governance     ReferenceGovernance   `json:"governance"`
	Datasets       []ReferenceDataset    `json:"datasets"`
}

// ReferenceGovernance defines the accountability and lifecycle for reference data
type ReferenceGovernance struct {
	DataOwner      string `json:"data_owner"`
	DataSteward    string `json:"data_steward"`
	Approver       string `json:"approver,omitempty"`
	ApprovalStatus string `json:"approval_status"` // draft, review, approved, deprecated
	ApprovalDate   string `json:"approval_date,omitempty"`
}

// ReferenceDataset represents a managed collection within a domain
type ReferenceDataset struct {
	ID                 int64                      `json:"id"`
	PackageID          int64                      `json:"package_id"`
	DatasetID          string                     `json:"dataset_id"`
	DatasetName        string                     `json:"dataset_name"`
	Description        string                     `json:"description,omitempty"`
	Status             string                     `json:"status"` // active, inactive, retired
	Classification     string                     `json:"classification,omitempty"`
	SourceSystem       string                     `json:"source_system,omitempty"`
	UpdateFrequency    string                     `json:"update_frequency,omitempty"`
	EffectiveDateField string                     `json:"effective_date_field,omitempty"`
	ExpiryDateField    string                     `json:"expiry_date_field,omitempty"`
	Keys               ReferenceKeys              `json:"keys"`
	Attributes         []ReferenceAttribute       `json:"attributes,omitempty"`
	CodeSets           []ReferenceCode            `json:"code_sets,omitempty"`
	QualityRules       []ReferenceQualityRule     `json:"quality_rules,omitempty"`
	Lineage            ReferenceLineage           `json:"lineage,omitempty"`
	SLA                *ReferenceSLA              `json:"sla,omitempty"`
	Records            []map[string]interface{}   `json:"records,omitempty"`
}

// ReferenceKeys defines identifies for the dataset records
type ReferenceKeys struct {
	BusinessKey  []string `json:"business_key"`
	SurrogateKey string   `json:"surrogate_key,omitempty"`
}

// ReferenceAttribute defines a column/field in the dataset
type ReferenceAttribute struct {
	Name          string   `json:"name"`
	DataType      string   `json:"data_type"`
	Nullable      bool     `json:"nullable"`
	Description   string   `json:"description,omitempty"`
	AllowedValues []string `json:"allowed_values,omitempty"`
}

// ReferenceCode represents a specific enumeration entry
type ReferenceCode struct {
	Code          string `json:"code"`
	Label         string `json:"label"`
	Description   string `json:"description,omitempty"`
	Status        string `json:"status"` // active, inactive, deprecated
	EffectiveFrom string `json:"effective_from,omitempty"`
	EffectiveTo   string `json:"effective_to,omitempty"`
	SortOrder     int    `json:"sort_order,omitempty"`
}

// ReferenceQualityRule defines a validation check
type ReferenceQualityRule struct {
	RuleID      string `json:"rule_id"`
	RuleType    string `json:"rule_type"` // uniqueness, completeness, etc.
	Severity    string `json:"severity"`  // low, medium, high, critical
	Expression  string `json:"expression,omitempty"`
	Description string `json:"description,omitempty"`
}

// ReferenceLineage tracks upstream and downstream systems
type ReferenceLineage struct {
	Upstream   []string `json:"upstream,omitempty"`
	Downstream []string `json:"downstream,omitempty"`
}

// ReferenceSLA defines service levels for the data
type ReferenceSLA struct {
	RefreshFrequency string `json:"refresh_frequency,omitempty"`
	LatencyTarget    string `json:"latency_target,omitempty"`
	LastRefreshUTC   string `json:"last_refresh_utc,omitempty"`
}
