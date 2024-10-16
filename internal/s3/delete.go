package s3

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/samber/lo"
)

func (c *Client) DeleteObjects(ctx context.Context, bucket string, keys ...string) ([]string, error) {
	if len(keys) == 0 {
		return nil, nil
	}

	var (
		err     error
		input   *s3.DeleteObjectsInput
		output  *s3.DeleteObjectsOutput
		deleted = make([]string, 0, len(keys))
	)

	//for _, items := range tool.Bulk(keys, 100) {
	input = &s3.DeleteObjectsInput{
		Bucket: aws.String(bucket),
		Delete: &types.Delete{
			Objects: lo.FilterMap(
				keys,
				func(item string, index int) (types.ObjectIdentifier, bool) {
					return types.ObjectIdentifier{Key: aws.String(item)}, item != ""
				},
			),
		},
	}

	if output, err = c.client.DeleteObjects(ctx, input); err != nil {
		return nil, err
	}

	deleted = append(deleted, lo.Map(output.Deleted, func(item types.DeletedObject, index int) string {
		return aws.ToString(item.Key)
	})...)
	//}

	return deleted, nil
}
