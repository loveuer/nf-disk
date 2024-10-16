package s3

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/samber/lo"
	"strings"
	"time"
)

type ListBucketRes struct {
	CreatedAt int64  `json:"created_at"`
	Name      string `json:"name"`
}

type ListFileType int64

const (
	ListFileTypeFile ListFileType = iota
	ListFileTypeDir
)

type ListFileRes struct {
	Name         string       `json:"name"`
	Key          string       `json:"key"`
	LastModified time.Time    `json:"last_modified"`
	Size         int64        `json:"size"`
	Type         ListFileType `json:"type"`
}

func (c *Client) ListBucket(ctx context.Context) ([]*ListBucketRes, error) {
	var (
		err   error
		input = &s3.ListBucketsInput{
			//MaxBuckets: aws.Int32(100),
		}
		output *s3.ListBucketsOutput
	)

	if output, err = c.client.ListBuckets(ctx, input); err != nil {
		return nil, err
	}

	res := lo.Map(
		output.Buckets,
		func(item types.Bucket, index int) *ListBucketRes {
			return &ListBucketRes{CreatedAt: item.CreationDate.UnixMilli(), Name: *item.Name}
		},
	)

	return res, nil
}

func (c *Client) ListFile(ctx context.Context, bucket string, prefix string) ([]*ListFileRes, error) {
	var (
		err   error
		input = &s3.ListObjectsV2Input{
			Delimiter: aws.String("/"),
			MaxKeys:   1000,
			Bucket:    aws.String(bucket),
		}
		output *s3.ListObjectsV2Output
	)

	if prefix != "" {
		input.Prefix = aws.String(prefix)
	}

	if output, err = c.client.ListObjectsV2(ctx, input); err != nil {
		return nil, err
	}

	folder := lo.FilterMap(
		output.CommonPrefixes,
		func(item types.CommonPrefix, index int) (*ListFileRes, bool) {
			name := strings.TrimPrefix(*item.Prefix, prefix)
			return &ListFileRes{
				Name: name,
				Key:  *item.Prefix,
				Type: ListFileTypeDir,
			}, name != ""
		},
	)

	list := lo.Map(
		output.Contents,
		func(item types.Object, index int) *ListFileRes {
			return &ListFileRes{
				Key:          strings.Clone(*item.Key),
				Name:         strings.TrimPrefix(*item.Key, prefix),
				LastModified: *item.LastModified,
				Size:         item.Size,
				Type:         ListFileTypeFile,
			}
		},
	)

	return append(folder, list...), nil
}
