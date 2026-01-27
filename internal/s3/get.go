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

type ObjectDetail struct {
	// 基础信息
	Bucket       string `json:"bucket"`
	Key          string `json:"key"`
	ContentType  string `json:"content_type"`
	Expire       int64  `json:"expire"`
	Size         uint64 `json:"size"`
	LastModified int64  `json:"last_modified"`

	// Header 信息
	ETag               string `json:"etag"`
	CacheControl       string `json:"cache_control"`
	ContentEncoding    string `json:"content_encoding"`
	ContentDisposition string `json:"content_disposition"`
	ContentLanguage    string `json:"content_language"`
	AcceptRanges       string `json:"accept_ranges"`

	// 存储信息
	StorageClass string `json:"storage_class"`
	VersionId    string `json:"version_id"`

	// 加密信息
	ServerSideEncryption string `json:"server_side_encryption"`
	SSEKMSKeyId          string `json:"sse_kms_key_id"`
	BucketKeyEnabled     bool   `json:"bucket_key_enabled"`

	// 自定义元数据
	Metadata    map[string]string `json:"metadata"`
	MissingMeta int32             `json:"missing_meta"`

	// 校验和
	ChecksumCRC32  string `json:"checksum_crc32,omitempty"`
	ChecksumCRC32C string `json:"checksum_crc32c,omitempty"`
	ChecksumSHA1   string `json:"checksum_sha1,omitempty"`
	ChecksumSHA256 string `json:"checksum_sha256,omitempty"`

	// 其他信息
	DeleteMarker            bool   `json:"delete_marker"`
	PartsCount              int32  `json:"parts_count"`
	WebsiteRedirectLocation string `json:"website_redirect_location"`

	// 归档信息
	ArchiveStatus string `json:"archive_status"`
	Restore       string `json:"restore"`

	// Object Lock 信息
	ObjectLockLegalHoldStatus string `json:"object_lock_legal_hold_status"`
	ObjectLockMode            string `json:"object_lock_mode"`
	ObjectLockRetainUntilDate int64  `json:"object_lock_retain_until_date"`

	// 复制信息
	ReplicationStatus string `json:"replication_status"`
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
		Bucket:       bucket,
		Key:          key,
		ContentType:  aws.ToString(output.ContentType),
		Expire:       aws.ToTime(output.Expires).UnixMilli(),
		Size:         uint64(output.ContentLength),
		LastModified: aws.ToTime(output.LastModified).UnixMilli(),
	}, nil
}

// GetObjectDetail - 获取对象的详细信息，包括所有header和元数据
func (c *Client) GetObjectDetail(ctx context.Context, bucket string, key string) (*ObjectDetail, error) {
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

	// 构建详细对象信息
	detail := &ObjectDetail{
		// 基础信息
		Bucket:       bucket,
		Key:          key,
		ContentType:  aws.ToString(output.ContentType),
		Expire:       aws.ToTime(output.Expires).UnixMilli(),
		Size:         uint64(output.ContentLength),
		LastModified: aws.ToTime(output.LastModified).UnixMilli(),

		// Header 信息
		ETag:               aws.ToString(output.ETag),
		CacheControl:       aws.ToString(output.CacheControl),
		ContentEncoding:    aws.ToString(output.ContentEncoding),
		ContentDisposition: aws.ToString(output.ContentDisposition),
		ContentLanguage:    aws.ToString(output.ContentLanguage),
		AcceptRanges:       aws.ToString(output.AcceptRanges),

		// 存储信息
		StorageClass: string(output.StorageClass),
		VersionId:    aws.ToString(output.VersionId),

		// 加密信息
		ServerSideEncryption: string(output.ServerSideEncryption),
		SSEKMSKeyId:          aws.ToString(output.SSEKMSKeyId),
		BucketKeyEnabled:     output.BucketKeyEnabled,

		// 自定义元数据
		Metadata:    output.Metadata,
		MissingMeta: output.MissingMeta,

		// 其他信息
		DeleteMarker:            output.DeleteMarker,
		PartsCount:              output.PartsCount,
		WebsiteRedirectLocation: aws.ToString(output.WebsiteRedirectLocation),

		// 归档信息
		ArchiveStatus: string(output.ArchiveStatus),
		Restore:       aws.ToString(output.Restore),

		// Object Lock 信息
		ObjectLockLegalHoldStatus: string(output.ObjectLockLegalHoldStatus),
		ObjectLockMode:            string(output.ObjectLockMode),
		ObjectLockRetainUntilDate: aws.ToTime(output.ObjectLockRetainUntilDate).UnixMilli(),

		// 复制信息
		ReplicationStatus: string(output.ReplicationStatus),
	}

	// 安全添加校验和信息（如果存在）
	if output.ChecksumCRC32 != nil {
		detail.ChecksumCRC32 = aws.ToString(output.ChecksumCRC32)
	}
	if output.ChecksumCRC32C != nil {
		detail.ChecksumCRC32C = aws.ToString(output.ChecksumCRC32C)
	}
	if output.ChecksumSHA1 != nil {
		detail.ChecksumSHA1 = aws.ToString(output.ChecksumSHA1)
	}
	if output.ChecksumSHA256 != nil {
		detail.ChecksumSHA256 = aws.ToString(output.ChecksumSHA256)
	}

	// 安全添加 Object Lock 时间信息
	if output.ObjectLockRetainUntilDate != nil {
		detail.ObjectLockRetainUntilDate = aws.ToTime(output.ObjectLockRetainUntilDate).UnixMilli()
	}

	return detail, nil
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
