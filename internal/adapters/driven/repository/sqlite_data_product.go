package repository

import (
	"data-host/internal/core/domain"
	"database/sql"
	"fmt"
	"time"
)

func (r *SQLiteRepository) GetDataProductCatalogs() ([]domain.DataProductCatalog, error) {
	rows, err := r.db.Query("SELECT dpro_catalog_id, catalog_name, description, source, generated_at_utc, platform, created_at_utc, updated_at_utc FROM DPRO_CATALOG ORDER BY catalog_name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.DataProductCatalog
	for rows.Next() {
		var c domain.DataProductCatalog
		var description, source, generatedAt, updatedAt sql.NullString
		if err := rows.Scan(&c.ID, &c.Name, &description, &source, &generatedAt, &c.Platform, &c.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		c.Description = description.String
		c.Source = source.String
		c.GeneratedAt = generatedAt.String
		if updatedAt.Valid {
			c.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt.String)
		}
		results = append(results, c)
	}
	return results, nil
}

func (r *SQLiteRepository) GetDataProductCatalogByID(id int64) (*domain.DataProductCatalog, error) {
	var c domain.DataProductCatalog
	var description, source, generatedAt, updatedAt sql.NullString
	err := r.db.QueryRow("SELECT dpro_catalog_id, catalog_name, description, source, generated_at_utc, platform, created_at_utc, updated_at_utc FROM DPRO_CATALOG WHERE dpro_catalog_id = ?", id).
		Scan(&c.ID, &c.Name, &description, &source, &generatedAt, &c.Platform, &c.CreatedAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	c.Description = description.String
	c.Source = source.String
	c.GeneratedAt = generatedAt.String
	if updatedAt.Valid {
		c.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt.String)
	}
	return &c, nil
}

func (r *SQLiteRepository) GetDataProductProducts(catalogID int64) ([]domain.DataProduct, error) {
	rows, err := r.db.Query(`
		SELECT dpro_product_id, dpro_catalog_id, product_id, product_group, lifecycle_status, owner, steward, 
		       producer_system, sla, refresh_expectation, product_name, surface, delivery_type, transformation_tier, 
		       description, consumer_requirement, created_at_utc, updated_at_utc
		FROM DPRO_PRODUCT WHERE dpro_catalog_id = ? ORDER BY product_id`, catalogID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.DataProduct
	for rows.Next() {
		var p domain.DataProduct
		var producer, sla, refresh, transform, updatedAt sql.NullString
		if err := rows.Scan(&p.ID, &p.CatalogID, &p.ProductID, &p.ProductGroup, &p.LifecycleStatus, &p.Owner, &p.Steward,
			&producer, &sla, &refresh, &p.ProductName, &p.Surface, &p.DeliveryType, &transform,
			&p.Description, &p.ConsumerRequirement, &p.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		p.ProducerSystem = producer.String
		p.SLA = sla.String
		p.RefreshExpectation = refresh.String
		p.TransformationTier = transform.String
		if updatedAt.Valid {
			p.UpdatedAt, _ = time.Parse(time.RFC3339, updatedAt.String)
		}

		// Fetch Primary Consumers
		crows, _ := r.db.Query("SELECT consumer_name FROM DPRO_PRODUCT_PRIMARY_CONSUMER WHERE dpro_product_id = ? ORDER BY ordinal_position", p.ID)
		for crows != nil && crows.Next() {
			var cn string
			crows.Scan(&cn)
			p.PrimaryConsumers = append(p.PrimaryConsumers, cn)
		}
		if crows != nil {
			crows.Close()
		}

		// Fetch Evidence Anchors
		arows, _ := r.db.Query("SELECT source, location, detail FROM DPRO_PRODUCT_EVIDENCE_ANCHOR WHERE dpro_product_id = ? ORDER BY ordinal_position", p.ID)
		for arows != nil && arows.Next() {
			var a domain.DataProductAnchor
			arows.Scan(&a.Source, &a.Location, &a.Detail)
			p.EvidenceAnchors = append(p.EvidenceAnchors, a)
		}
		if arows != nil {
			arows.Close()
		}

		results = append(results, p)
	}
	return results, nil
}

func (r *SQLiteRepository) SaveDataProductCatalog(catalog *domain.DataProductCatalog, products []domain.DataProduct) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert or update catalog
	var catalogID int64
	err = tx.QueryRow("SELECT dpro_catalog_id FROM DPRO_CATALOG WHERE catalog_name = ? AND platform = ?", catalog.Name, catalog.Platform).Scan(&catalogID)
	if err == sql.ErrNoRows {
		res, err := tx.Exec(`INSERT INTO DPRO_CATALOG (catalog_name, description, source, generated_at_utc, platform) VALUES (?, ?, ?, ?, ?)`,
			catalog.Name, catalog.Description, catalog.Source, catalog.GeneratedAt, catalog.Platform)
		if err != nil {
			return err
		}
		catalogID, _ = res.LastInsertId()
	} else if err != nil {
		return err
	} else {
		_, err = tx.Exec(`UPDATE DPRO_CATALOG SET description = ?, source = ?, generated_at_utc = ?, updated_at_utc = CURRENT_TIMESTAMP WHERE dpro_catalog_id = ?`,
			catalog.Description, catalog.Source, catalog.GeneratedAt, catalogID)
		if err != nil {
			return err
		}
		// Clear existing products to re-insert (simple replacement strategy)
		_, _ = tx.Exec("DELETE FROM DPRO_PRODUCT WHERE dpro_catalog_id = ?", catalogID)
	}

	// 2. Insert products
	for _, p := range products {
		res, err := tx.Exec(`
			INSERT INTO DPRO_PRODUCT (
				dpro_catalog_id, product_id, product_group, lifecycle_status, owner, steward, 
				producer_system, sla, refresh_expectation, product_name, surface, delivery_type, 
				transformation_tier, description, consumer_requirement
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			catalogID, p.ProductID, p.ProductGroup, p.LifecycleStatus, p.Owner, p.Steward,
			p.ProducerSystem, p.SLA, p.RefreshExpectation, p.ProductName, p.Surface, p.DeliveryType,
			p.TransformationTier, p.Description, p.ConsumerRequirement)
		if err != nil {
			return fmt.Errorf("failed to insert product %s: %w", p.ProductID, err)
		}
		productID, _ := res.LastInsertId()

		// Consumers
		for i, c := range p.PrimaryConsumers {
			_, err = tx.Exec("INSERT INTO DPRO_PRODUCT_PRIMARY_CONSUMER (dpro_product_id, consumer_name, ordinal_position) VALUES (?, ?, ?)",
				productID, c, i+1)
			if err != nil {
				return err
			}
		}

		// Anchors
		for i, a := range p.EvidenceAnchors {
			_, err = tx.Exec("INSERT INTO DPRO_PRODUCT_EVIDENCE_ANCHOR (dpro_product_id, source, location, detail, ordinal_position) VALUES (?, ?, ?, ?, ?)",
				productID, a.Source, a.Location, a.Detail, i+1)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}
