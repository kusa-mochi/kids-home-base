package dbmanager

import (
	"testing"
	"time"
)

func TestNormalizeUTC(t *testing.T) {
	loc, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		t.Fatalf("failed to load location: %v", err)
	}
	m := &DBManager{loc: loc}

	jst := time.Date(2026, 8, 9, 12, 0, 0, 0, loc)
	utc := m.normalizeUTC(jst)

	if utc.Location() != time.UTC {
		t.Fatalf("expected UTC location, got %v", utc.Location())
	}
	if utc.Format(time.RFC3339) != "2026-08-09T03:00:00Z" {
		t.Fatalf("unexpected UTC conversion: %s", utc.Format(time.RFC3339))
	}
}

func TestSQLiteLocalDateModifier(t *testing.T) {
	loc, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		t.Fatalf("failed to load location: %v", err)
	}
	m := &DBManager{loc: loc}

	modifier := m.sqliteLocalDateModifier(time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC))
	if modifier != "+540 minutes" {
		t.Fatalf("unexpected modifier: %s", modifier)
	}
}

func TestLocalDateString(t *testing.T) {
	loc, err := time.LoadLocation("Asia/Tokyo")
	if err != nil {
		t.Fatalf("failed to load location: %v", err)
	}
	m := &DBManager{loc: loc}

	baseUTC := time.Date(2026, 8, 9, 14, 59, 0, 0, time.UTC)
	today := m.localDateString(baseUTC, 0)
	tomorrow := m.localDateString(baseUTC, 1)

	if today != "2026-08-09" {
		t.Fatalf("unexpected local today: %s", today)
	}
	if tomorrow != "2026-08-10" {
		t.Fatalf("unexpected local tomorrow: %s", tomorrow)
	}
}
