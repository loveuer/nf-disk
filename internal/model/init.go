package model

import (
	"gorm.io/gorm"
)

func Init(tx *gorm.DB) (err error) {
	err = tx.AutoMigrate(
		&Connection{},
	)

	return
}
