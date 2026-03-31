package repository

import (
	"encoding/json"
	"fmt"

	"github.com/rs/zerolog/log"
	"data-host/internal/core/domain"
)

func (r *SQLiteRepository) SaveTaxonomy(payload interface{}) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	var tax struct {
		Name          string `json:"name"`
		Version       string `json:"version"`
		Title         string `json:"title"`
		Description   string `json:"description"`
		TaxonomyType  string `json:"taxonomy_type"`
		Source        string `json:"source"`
		Language      string `json:"default_language"`
		GeneratedAt   string `json:"generated_at_utc"`
		Governance    struct {
			Owner    string `json:"owner"`
			Steward  string `json:"steward"`
			Approver string `json:"approver"`
			Status   string `json:"approval_status"`
			Approved string `json:"approved_at"`
		} `json:"governance"`
		Terms []struct {
			TermID         string `json:"term_id"`
			Label          string `json:"label"`
			Definition     string `json:"definition"`
			Status         string `json:"status"`
			Type           string `json:"term_type"`
			Language       string `json:"language"`
			Parent         string `json:"parent_term_id"`
			Classification string `json:"classification"`
			Owner          string `json:"owner"`
			Steward        string `json:"steward"`
		} `json:"terms"`
	}

	if err := json.Unmarshal(bytes, &tax); err != nil {
		return err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// check if it exists or insert (we'll assume version must be unique or we can just replace)
	const insertTax = `
		INSERT INTO TAX_TAXONOMY (taxonomy_name, version, title, description, taxonomy_type, source, generated_at_utc, default_language)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	res, err := tx.Exec(insertTax, tax.Name, tax.Version, tax.Title, tax.Description, tax.TaxonomyType, tax.Source, tax.GeneratedAt, tax.Language)
	if err != nil {
		log.Warn().Err(err).Msg("failed to insert taxonomy, returning err")
		tx.Rollback()
		return fmt.Errorf("duplicate taxonomy version: %w", err)
	}

	taxID, _ := res.LastInsertId()

	if tax.Governance.Owner != "" || tax.Governance.Status != "" {
		const insertGov = `
			INSERT INTO TAX_TAXONOMY_GOVERNANCE (tax_taxonomy_id, owner, steward, approver, approval_status, approved_at)
			VALUES (?, ?, ?, ?, ?, ?)
		`
		_, err = tx.Exec(insertGov, taxID, tax.Governance.Owner, tax.Governance.Steward, tax.Governance.Approver, tax.Governance.Status, tax.Governance.Approved)
		if err != nil {
			return err
		}
	}

	for _, term := range tax.Terms {
		// Nullable term_type
		var termType *string
		if term.Type != "" {
			termType = &term.Type
		}

		var classification *string
		if term.Classification != "" {
			classification = &term.Classification
		}

		if term.Status == "" {
			term.Status = "active" // fallback
		}

		const insertTerm = `
			INSERT INTO TAX_TERM (tax_taxonomy_id, term_id, label, definition, status, term_type, language, parent_term_id, classification, owner, steward)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
		_, err = tx.Exec(insertTerm, taxID, term.TermID, term.Label, term.Definition, term.Status, termType, term.Language, term.Parent, classification, term.Owner, term.Steward)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *SQLiteRepository) GetTaxonomies() ([]domain.Taxonomy, error) {
	rows, err := r.db.Query(`
		SELECT tax_taxonomy_id as id, taxonomy_name, version, title, description, taxonomy_type, source, generated_at_utc, default_language
		FROM TAX_TAXONOMY
		ORDER BY taxonomy_name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.Taxonomy
	for rows.Next() {
		var t domain.Taxonomy
		var title, desc, taxType, source, genAt, lang NullStringScanner
		err := rows.Scan(&t.ID, &t.Name, &t.Version, &title, &desc, &taxType, &source, &genAt, &lang)
		if err != nil {
			return nil, err
		}
		t.Title = title.String
		t.Description = desc.String
		t.TaxonomyType = taxType.String
		t.Source = source.String
		t.GeneratedAt = genAt.String
		t.Language = lang.String
		results = append(results, t)
	}
	return results, nil
}

func (r *SQLiteRepository) GetTaxonomyByID(id int64) (*domain.Taxonomy, error) {
	var t domain.Taxonomy
	var title, desc, taxType, source, genAt, lang NullStringScanner
	err := r.db.QueryRow(`
		SELECT tax_taxonomy_id as id, taxonomy_name, version, title, description, taxonomy_type, source, generated_at_utc, default_language
		FROM TAX_TAXONOMY
		WHERE tax_taxonomy_id = ?
	`, id).Scan(&t.ID, &t.Name, &t.Version, &title, &desc, &taxType, &source, &genAt, &lang)

	if err != nil {
		return nil, err
	}

	t.Title = title.String
	t.Description = desc.String
	t.TaxonomyType = taxType.String
	t.Source = source.String
	t.GeneratedAt = genAt.String
	t.Language = lang.String

	return &t, nil
}

func (r *SQLiteRepository) GetTaxonomyTerms(taxonomyID int64) ([]domain.TaxonomyTerm, error) {
	rows, err := r.db.Query(`
		SELECT tax_term_id as id, tax_taxonomy_id, term_id, label, definition, status, term_type, language, parent_term_id, classification, owner, steward
		FROM TAX_TERM
		WHERE tax_taxonomy_id = ?
		ORDER BY label ASC
	`, taxonomyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var terms []domain.TaxonomyTerm
	for rows.Next() {
		var tm domain.TaxonomyTerm
		var label, def, status, termType, lang, parent, class, owner, steward NullStringScanner
		err := rows.Scan(&tm.ID, &tm.TaxonomyID, &tm.TermID, &label, &def, &status, &termType, &lang, &parent, &class, &owner, &steward)
		if err != nil {
			return nil, err
		}
		tm.Label = label.String
		tm.Definition = def.String
		tm.Status = status.String
		tm.TermType = termType.String
		tm.Language = lang.String
		tm.ParentTermID = parent.String
		tm.Classification = class.String
		tm.Owner = owner.String
		tm.Steward = steward.String
		terms = append(terms, tm)
	}
	return terms, nil
}

type NullStringScanner struct {
	String string
	Valid  bool
}

func (n *NullStringScanner) Scan(value interface{}) error {
	if value == nil {
		n.String, n.Valid = "", false
		return nil
	}
	n.Valid = true
	switch v := value.(type) {
	case string:
		n.String = v
	case []byte:
		n.String = string(v)
	default:
		n.String = fmt.Sprintf("%v", v)
	}
	return nil
}
