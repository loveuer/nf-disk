package s3

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

func (c *Client) CreateBucket(ctx context.Context, bucket string, publicRead bool, publicReadWrite bool) error {
	var (
		err   error
		input = &s3.CreateBucketInput{
			Bucket: aws.String(bucket),
			ACL:    types.BucketCannedACLAuthenticatedRead,
		}

		output = &s3.CreateBucketOutput{}
	)

	if publicRead {
		input.ACL = types.BucketCannedACLPublicRead
	}

	if publicReadWrite {
		input.ACL = types.BucketCannedACLPublicReadWrite
	}

	if output, err = c.client.CreateBucket(ctx, input); err != nil {
		return err
	}

	_ = output

	return nil
}
