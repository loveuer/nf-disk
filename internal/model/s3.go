package model

import (
	"errors"
	"github.com/loveuer/nf-disk/ndh"
	"gorm.io/gorm"
)

type Connection struct {
	Id        uint64 `json:"id" gorm:"primaryKey;column:id"`
	CreatedAt int64  `json:"created_at" gorm:"column:created_at;autoCreateTime:milli"`
	UpdatedAt int64  `json:"updated_at" gorm:"column:updated_at;autoUpdateTime:milli"`
	DeletedAt int64  `json:"deleted_at" gorm:"index;column:deleted_at;default:0"`
	Name      string `json:"name" gorm:"unique;column:name"`
	Endpoint  string `json:"endpoint" gorm:"column:endpoint"`
	Access    string `json:"access" gorm:"column:access"`
	Key       string `json:"key" gorm:"column:key"`

	Active bool `json:"active" gorm:"-"`
}

func (c *Connection) Create(tx *gorm.DB) error {
	return tx.Create(c).Error
}

func (c *Connection) Get(tx *gorm.DB, ctx *ndh.Ctx) error {
	if err := tx.Take(c, c.Id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ctx.Send400(err.Error())
		}

		return ctx.Send500(err.Error())
	}

	return nil
}
