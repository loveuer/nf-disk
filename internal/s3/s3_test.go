package s3

import (
	"context"
	"github.com/loveuer/nf-disk/internal/tool"
	"github.com/loveuer/nf/nft/log"
	"testing"
)

func TestNewClient(t *testing.T) {
	log.SetLogLevel(log.LogLevelDebug)
	_, err := New(context.TODO(), "http://10.220.10.15:9000/", "8ALV3DUZI31YG4BDRJ0Z", "CRqwS1MsiUj27TbRK+3T2n+LpKWd07VvaDKuzU0H")
	if err != nil {
		t.Fatalf("call s3.New err = %s", err.Error())
	}
}

func TestListFile(t *testing.T) {
	//log.SetLogLevel(log.LogLevelDebug)

	//cli, err := New(context.TODO(), "http://10.220.10.14:19000", "5VCR05L4BSGNCTCD8DXP", "FPTMYBEiHhWLJ05C3aGXW8bjFXXNmghc8Za3Fo2u")
	cli, err := New(context.TODO(), "http://10.220.10.15:9000/", "8ALV3DUZI31YG4BDRJ0Z", "CRqwS1MsiUj27TbRK+3T2n+LpKWd07VvaDKuzU0H")
	if err != nil {
		t.Fatalf("call s3.New err = %s", err.Error())
	}

	files, err := cli.ListFile(tool.Timeout(30), "topic-audit", "")
	if err != nil {
		t.Fatalf("call s3.ListFile err = %s", err.Error())
	}

	t.Logf("[x] file length = %d", len(files))

	for _, item := range files {
		t.Logf("[x: %d] file = %s, size = %d", item.Type, item.Name, item.Size)
	}
}
