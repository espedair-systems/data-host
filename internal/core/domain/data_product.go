package domain

import (
	"time"
)

type DataProductCatalog struct {
	ID          int64     `json:"id"`
	Name        string    `json:"catalog_name"`
	Description string    `json:"description"`
	Source      string    `json:"source"`
	GeneratedAt string    `json:"generated_at_utc"`
	Platform    string    `json:"platform"`
	CreatedAt   time.Time `json:"created_at_utc"`
	UpdatedAt   time.Time `json:"updated_at_utc"`
}

type DataProduct struct {
	ID                  int64     `json:"id"`
	CatalogID           int64     `json:"catalog_id"`
	ProductID           string    `json:"product_id"`
	ProductGroup        string    `json:"product_group"`
	LifecycleStatus     string    `json:"lifecycle_status"`
	Owner               string    `json:"owner"`
	Steward             string    `json:"steward"`
	ProducerSystem      string    `json:"producer_system"`
	SLA                 string    `json:"sla"`
	RefreshExpectation  string    `json:"refresh_expectation"`
	ProductName         string    `json:"product_name"`
	Surface             string    `json:"surface"`
	DeliveryType        string    `json:"delivery_type"`
	TransformationTier  string    `json:"transformation_tier"`
	Description         string    `json:"description"`
	ConsumerRequirement string    `json:"consumer_requirement"`
	CreatedAt           time.Time `json:"created_at_utc"`
	UpdatedAt           time.Time `json:"updated_at_utc"`

	PrimaryConsumers []string             `json:"primary_consumers,omitempty"`
	EvidenceAnchors  []DataProductAnchor `json:"evidence_anchors,omitempty"`
}

type DataProductAnchor struct {
	Source   string `json:"source"`
	Location string `json:"location"`
	Detail   string `json:"detail"`
}
