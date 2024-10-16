package s3

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"io"
	"time"
)

type PutFilesObj struct {
	Key             string
	Reader          io.ReadSeeker
	ContentLength   int64
	ContentType     string
	ExpireAt        int64
	PublicRead      bool
	PublicReadWrite bool
}

func (c *Client) PutFile(ctx context.Context, bucket string, obj *PutFilesObj) error {
	var (
		err   error
		input = &s3.PutObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(obj.Key),
			Body:   obj.Reader,
			ACL:    types.ObjectCannedACLPrivate,
		}
		output *s3.PutObjectOutput
	)

	if obj.ExpireAt > 0 {
		t := time.UnixMilli(obj.ExpireAt)
		input.Expires = &t
	}

	if obj.ContentLength > 0 {
		input.ContentLength = obj.ContentLength
	}

	if obj.ContentType == "" {
		input.ContentType = aws.String(obj.ContentType)
	}

	if obj.PublicRead {
		input.ACL = types.ObjectCannedACLPublicRead
	}

	if obj.PublicReadWrite {
		input.ACL = types.ObjectCannedACLPublicReadWrite
	}

	if output, err = c.client.PutObject(ctx, input); err != nil {
		return err
	}

	_ = output

	return nil
}
