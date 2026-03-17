package domain

type CheckResult struct {
	OK   bool   `json:"ok"`
	Text string `json:"text"`
}

type BootstrapStatus struct {
	Phase   string        `json:"phase"`
	Results []CheckResult `json:"results"`
}
