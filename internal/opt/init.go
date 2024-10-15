package opt

import (
	"os"
	"path/filepath"
)

func Init() error {
	var (
		err error
	)

	if ConfigDir, err = os.UserConfigDir(); err != nil {
		return err
	}

	if os.MkdirAll(filepath.Join(ConfigDir, "nf-disk"), 0755); err != nil {
		return err
	}

	ConfigFile = filepath.Join(ConfigDir, "nf-disk", "config.db")

	return nil
}
