package s3

import (
	"context"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/loveuer/nf/nft/log"
)

type ObjectInfo struct {
	Bucket       string `json:"bucket"`
	Key          string `json:"key"`
	ContentType  string `json:"content_type"`
	Expire       int64  `json:"expire"`
	Size         uint64 `json:"size"`
	LastModified int64  `json:"last_modified"` // unix millisecond
}

func (c *Client) GetObjectInfo(ctx context.Context, bucket string, key string) (*ObjectInfo, error) {
	var (
		err   error
		input = &s3.HeadObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(key),
		}
		output *s3.HeadObjectOutput
	)

	if output, err = c.client.HeadObject(ctx, input); err != nil {
		return nil, err
	}

	return &ObjectInfo{
		Bucket:      bucket,
		Key:         key,
		ContentType: aws.ToString(output.ContentType),
		Expire:      aws.ToTime(output.Expires).UnixMilli(),
		Size:        uint64(output.ContentLength),
		LastModified: aws.ToTime(output.LastModified).UnixMilli(),
	}, nil
}

// GetObject
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html

type Presigner struct {
	PresignClient *s3.PresignClient
}

func (presigner *Presigner) GetObject(ctx context.Context, bucketName string, objectKey string, lifetimeSecs int64) (*v4.PresignedHTTPRequest, error) {
	request, err := presigner.PresignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = time.Duration(lifetimeSecs * int64(time.Second))
	})
	if err != nil {
		log.Error("Presigner: couldn't get a presigned request to get %v:%v. Here's why: %v",
			bucketName, objectKey, err)
	}
	return request, err
}

type ObjectEntry struct {
	URL    string      `json:"url"`
	Method string      `json:"method"`
	Header http.Header `json:"header"`
}

func (c *Client) GetObjectEntry(ctx context.Context, bucket string, key string, lifetimes ...int64) (*ObjectEntry, error) {
	var (
		err      error
		lifetime int64 = 5 * 60
		pc             = &Presigner{PresignClient: s3.NewPresignClient(c.client)}
		output   *v4.PresignedHTTPRequest
	)

	if len(lifetimes) > 0 && lifetimes[0] > 0 {
		lifetime = lifetimes[0]
	}

	if output, err = pc.GetObject(ctx, bucket, key, lifetime); err != nil {
		return nil, err
	}

	return &ObjectEntry{
		URL:    output.URL,
		Method: output.Method,
		Header: output.SignedHeader,
	}, nil
}

type ObjectEntity struct {
	ObjectInfo
	Body io.ReadCloser `json:"body"`
}

func (c *Client) GetObject(ctx context.Context, bucket string, key string) (*ObjectEntity, error) {
	var (
		err   error
		input = &s3.GetObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(key),
		}
		output *s3.GetObjectOutput
	)

	if output, err = c.client.GetObject(ctx, input); err != nil {
		return nil, err
	}

	return &ObjectEntity{
		ObjectInfo: ObjectInfo{
			Bucket:       bucket,
			Key:          key,
			ContentType:  aws.ToString(output.ContentType),
			Expire:       aws.ToTime(output.Expires).UnixMilli(),
			Size:         uint64(output.ContentLength),
			LastModified: aws.ToTime(output.LastModified).UnixMilli(),
		},
		Body: output.Body,
	}, nil
}
