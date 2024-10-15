package tool

import "github.com/loveuer/nf/nft/log"

func Must(errs ...error) {
	for _, err := range errs {
		if err != nil {
			log.Panic(err.Error())
		}
	}
}
