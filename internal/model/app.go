package model

type EmitEvent string

const (
	EmitEventDownload EmitEvent = "download"
)

type App interface {
	Emit(event EmitEvent, data any)
}
