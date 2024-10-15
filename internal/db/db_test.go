package db

import (
	"context"
	"io"
	"os"
	"testing"
)

func TestOpen(t *testing.T) {
	myClient, err := New(context.TODO(), "sqlite::", OptSqliteByMem())
	if err != nil {
		t.Fatalf("TestOpen: New err = %v", err)
	}

	type Start struct {
		Id   int     `json:"id" gorm:"column:id;primaryKey"`
		Name string  `json:"name" gorm:"column:name"`
		Dis  float64 `json:"dis" gorm:"column:dis"`
	}

	if err = myClient.Session().AutoMigrate(&Start{}); err != nil {
		t.Fatalf("TestOpen: AutoMigrate err = %v", err)
	}

	if err = myClient.Session().Create(&Start{Name: "sun", Dis: 6631.76}).Error; err != nil {
		t.Fatalf("TestOpen: Create err = %v", err)
	}

	if err = myClient.Session().Create(&Start{Name: "mar", Dis: 786.35}).Error; err != nil {
		t.Fatalf("TestOpen: Create err = %v", err)
	}

	if reader, ok := myClient.Dump(); ok {
		bs, err := io.ReadAll(reader)
		if err != nil {
			t.Fatalf("TestOpen: ReadAll err = %v", err)
		}

		os.WriteFile("dump.db", bs, 0644)
	}

	myClient.Close()
}
