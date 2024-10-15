package manager

import (
	"context"
	"github.com/loveuer/nf-disk/internal/model"
	"github.com/loveuer/nf-disk/internal/s3"
	"github.com/loveuer/nf/nft/log"
	"sync"
)

type client struct {
	conn   *model.Connection
	client *s3.Client
}

type manager struct {
	sync.Mutex
	clients map[uint64]*client
}

var (
	Manager *manager
)

func Init(ctx context.Context) error {
	Manager = &manager{
		clients: make(map[uint64]*client),
	}

	return nil
}

func (m *manager) Register(c *model.Connection, s *s3.Client) error {
	log.Debug("manager: register connection-client: id = %d, name = %s", c.Id, c.Name)

	Manager.Lock()
	defer Manager.Unlock()
	Manager.clients[c.Id] = &client{conn: c, client: s}

	return nil
}

func (m *manager) UnRegister(id uint64) error {
	Manager.Lock()
	defer Manager.Unlock()
	c, ok := m.clients[id]
	if !ok {
		return ErrNotFound
	}

	log.Debug("manager: register connection-client: id = %d, name = %s", c.conn, c.conn.Name)

	delete(m.clients, id)

	return nil
}

func (m *manager) Map(fn func(*model.Connection, *s3.Client) error) error {
	for _, item := range m.clients {
		if err := fn(item.conn, item.client); err != nil {
			return err
		}
	}

	return nil
}

func (m *manager) Use(id uint64) (*model.Connection, *s3.Client, error) {
	c, ok := m.clients[id]
	if !ok {
		return nil, nil, ErrNotFound
	}

	return c.conn, c.client, nil
}
