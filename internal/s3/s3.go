package s3

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	smithyendpoints "github.com/aws/smithy-go/endpoints"
	"github.com/loveuer/nf-disk/internal/tool"
	"github.com/loveuer/nf/nft/log"
	"net/url"
)

type resolverV2 struct{}

func (*resolverV2) ResolveEndpoint(ctx context.Context, params s3.EndpointParameters) (smithyendpoints.Endpoint, error) {
	u, err := url.Parse(*params.Endpoint)
	if err != nil {
		log.Warn("resolver v2: parse url = %s, err = %s", params.Endpoint, err.Error())
		return smithyendpoints.Endpoint{}, err
	}
	return smithyendpoints.Endpoint{
		URI: *u,
	}, nil

}

type Client struct {
	client *s3.Client
}

func New(ctx context.Context, endpoint string, access string, key string) (*Client, error) {
	var (
		err       error
		sdkConfig aws.Config
		output    *s3.ListBucketsOutput
	)

	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: endpoint,
		}, nil
	})

	if sdkConfig, err = config.LoadDefaultConfig(
		ctx,
		config.WithEndpointResolverWithOptions(customResolver),
	); err != nil {
		return nil, err
	}

	s3Client := s3.NewFromConfig(sdkConfig, func(o *s3.Options) {
		//o.BaseEndpoint = aws.String(endpoint)
		//o.EndpointResolverV2 = &resolverV2{}
		o.Credentials = aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(access, key, ""))
		o.UsePathStyle = true
		o.Region = "auto"
	})

	if output, err = s3Client.ListBuckets(tool.Timeout(5), &s3.ListBucketsInput{
		MaxBuckets: aws.Int32(2),
	}); err != nil {
		return nil, err
	}

	for _, item := range output.Buckets {
		log.Debug("s3.New: list bucket name = %s", *item.Name)
	}

	return &Client{client: s3Client}, nil
}
