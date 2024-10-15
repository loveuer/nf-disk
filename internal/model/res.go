package model

import "encoding/json"

type Res struct {
	Status uint32 `json:"status"`
	Err    string `json:"err"`
	Msg    string `json:"msg"`
	Data   any    `json:"data"`
}

func NewRes(status uint32, err string, msg string, data any) *Res {
	return &Res{
		Status: status,
		Err:    err,
		Msg:    msg,
		Data:   data,
	}
}

func (r *Res) String() string {
	bs, _ := json.Marshal(r)
	return string(bs)
}
