/*
 * Domain Layer: Core business models and logic.
 * This layer is independent of any external frameworks or infrastructure.
 */
package domain

type CheckResult struct {
	OK   bool   `json:"ok"`
	Text string `json:"text"`
}

type AppResponse struct {
	OK   bool   `json:"ok"`
	Text string `json:"text"`
}

type BootstrapStatus struct {
	Phase   string        `json:"phase"`
	Results []CheckResult `json:"results"`
}
