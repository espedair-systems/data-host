package domain

import "time"

// BusinessInformationModel represents the top-level structure of a BIM document
type BusinessInformationModel struct {
	ID                 int64       `json:"id,omitempty"`
	Name               string      `json:"name"`
	Description        string      `json:"description"`
	Source             string      `json:"source"`
	GeneratedAtUTC     string      `json:"generated_at_utc"`
	Stats              BIMStats    `json:"stats"`
	Entities           []BIMEntity `json:"entities"`
	CreatedAt          time.Time   `json:"created_at_utc"`
	UpdatedAt          time.Time   `json:"updated_at_utc,omitempty"`
}

// BIMStats contains metrics about the information model
type BIMStats struct {
	TotalEntities     int `json:"total_entities"`
	DataDomains       int `json:"data_domains"`
	DataConcepts      int `json:"data_concepts"`
	DuplicatesRemoved int `json:"duplicates_removed"`
}

// BIMEntity represents a single business entity (Domain or Concept)
type BIMEntity struct {
	ID                                     int64                   `json:"id,omitempty"`
	ModelID                                int64                   `json:"bim_model_id,omitempty"`
	Name                                   string                  `json:"name"`
	AssetType                              string                  `json:"asset_type"`
	Description                            string                  `json:"description"`
	InformationConfidentialityClassification string                  `json:"information_confidentiality_classification"`
	Roles                                  BIMEntityRole           `json:"roles"`
	Relationships                          []BIMEntityRelationship `json:"relationships"`
	CreatedAt                              time.Time               `json:"created_at_utc"`
	UpdatedAt                              time.Time               `json:"updated_at_utc,omitempty"`
}

// BIMEntityRole defines governance roles for an entity
type BIMEntityRole struct {
	DataOwnerUserName        string `json:"data_owner_user_name"`
	DataOwnerFirstName       string `json:"data_owner_first_name"`
	DataOwnerLastName        string `json:"data_owner_last_name"`
	DataOwnerGroupName       string `json:"data_owner_group_name"`
	BusinessStewardUserName   string `json:"business_steward_user_name"`
	BusinessStewardFirstName  string `json:"business_steward_first_name"`
	BusinessStewardLastName   string `json:"business_steward_last_name"`
	BusinessStewardGroupName  string `json:"business_steward_group_name"`
	DataCustodianUserName    string `json:"data_custodian_user_name"`
	DataCustodianFirstName   string `json:"data_custodian_first_name"`
	DataCustodianLastName    string `json:"data_custodian_last_name"`
	DataCustodianGroupName   string `json:"data_custodian_group_name"`
	DataStewardUserName      string `json:"data_steward_user_name"`
	DataStewardFirstName     string `json:"data_steward_first_name"`
	DataStewardLastName      string `json:"data_steward_last_name"`
	DataStewardGroupName     string `json:"data_steward_group_name"`
}

// BIMEntityRelationship represents a hierarchical link
type BIMEntityRelationship struct {
	ID                                         int64     `json:"id,omitempty"`
	EntityID                                   int64     `json:"bim_entity_id,omitempty"`
	DataConceptGroupsDataConceptName           string    `json:"data_concept_groups_data_concept_name"`
	DataConceptIsGroupedByDataConceptName      string    `json:"data_concept_is_grouped_by_data_concept_name"`
	DataConceptIsGroupedByDataDomainName        string    `json:"data_concept_is_grouped_by_data_domain_name"`
	DataDomainGroupsDataConceptName            string    `json:"data_domain_groups_data_concept_name"`
	CreatedAt                                  time.Time `json:"created_at_utc"`
}
