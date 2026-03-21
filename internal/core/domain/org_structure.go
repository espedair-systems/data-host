package domain

type OrgMetadata struct {
	Organization string `json:"organization"`
	Version      string `json:"version"`
	LastUpdated  string `json:"last_updated"`
}

type OrgDepartment struct {
	Name  string   `json:"name"`
	Lead  string   `json:"lead"`
	Teams []string `json:"teams"`
}

type OrgStructure struct {
	Metadata    OrgMetadata     `json:"metadata"`
	Departments []OrgDepartment `json:"departments"`
}
