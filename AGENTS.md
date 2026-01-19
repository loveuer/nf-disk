# AGENTS.md

This file contains guidelines and commands for agentic coding agents working on the nf-disk project.

## Project Overview

nf-disk is a Wails-based desktop application for managing S3 storage. The project consists of:
- **Backend**: Go application using Wails v2 framework
- **Frontend**: React + TypeScript with Vite, FluentUI components, and Zustand state management
- **Database**: SQLite with GORM
- **S3 Integration**: AWS SDK v2 for S3 operations

## Build & Development Commands

### Backend (Go)
```bash
# Build the application
go build -o nf-disk ./main.go

# Run tests
go test ./...                          # Run all tests
go test ./internal/s3/                 # Run tests for specific package
go test -v ./internal/s3/              # Run tests with verbose output
go test -run TestNewClient ./internal/s3/  # Run specific test

# Development
go mod tidy                            # Clean up dependencies
go run main.go                         # Run the application directly
```

### Frontend (React/TypeScript)
```bash
cd frontend/

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit                       # Type check without emitting files
```

### Wails Commands
```bash
# Install Wails CLI first (if not available)
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Development mode
wails dev                              # Run with hot reload

# Build application
wails build                            # Build for current platform
wails build -platform darwin/amd64     # Build for specific platform
wails build -platform windows/amd64    # Build for Windows
```

## Code Style Guidelines

### Go Backend

#### Import Organization
- Group imports in three sections: standard library, third-party, project imports
- Use blank line between groups
- Sort imports within each group alphabetically

```go
import (
    "context"
    "fmt"
    "sync"

    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/loveuer/nf/nft/log"

    "github.com/loveuer/nf-disk/internal/model"
    "github.com/loveuer/nf-disk/internal/s3"
)
```

#### Naming Conventions
- **Packages**: lowercase, single word when possible (e.g., `s3`, `manager`, `tool`)
- **Variables**: camelCase for local variables, PascalCase for exported
- **Functions**: PascalCase for exported, camelCase for unexported
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Interfaces**: PascalCase, often ending with `-er` suffix (e.g., `Client`, `Manager`)

#### Error Handling
- Always handle errors explicitly
- Use `if err != nil` pattern consistently
- Return errors from functions without wrapping unless adding context
- Use structured logging with `log.Debug()`, `log.Info()`, `log.Error()`

```go
func New(ctx context.Context, endpoint string) (*Client, error) {
    if endpoint == "" {
        return nil, fmt.Errorf("endpoint cannot be empty")
    }
    
    client, err := createClient(ctx, endpoint)
    if err != nil {
        return nil, err
    }
    
    return &Client{client: client}, nil
}
```

#### Context Usage
- Accept `context.Context` as first parameter in functions that perform I/O
- Use `tool.Timeout(seconds)` for operations with specific timeout requirements
- Pass context through call chains properly

#### Concurrency
- Use `sync.Mutex` for protecting shared state
- Always `defer mutex.Unlock()` after `mutex.Lock()`
- Use goroutines for background operations

### TypeScript Frontend

#### Import Organization
- React and related imports first
- Third-party libraries second
- Project imports last
- Use absolute imports from `src/` when possible

```typescript
import React, {useState, useEffect} from 'react'
import {Button, Card} from '@fluentui/react-components'
import {create} from 'zustand'

import {Connection} from '../interfaces/connection'
import {useStoreConnection} from '../store/connection'
```

#### Component Structure
- Use functional components with hooks
- Define interfaces/types for props
- Use TypeScript strictly - no `any` types
- Follow PascalCase for component names

```typescript
interface ConnectionListProps {
    onConnectionSelect: (connection: Connection) => void
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
    onConnectionSelect
}) => {
    // Component logic
}
```

#### State Management
- Use Zustand for global state
- Define store interfaces with clear naming
- Use async actions for API calls

```typescript
interface StoreConnection {
    conn_active: Connection | null
    conn_list: Connection[]
    conn_get: () => Promise<void>
    conn_set: (connection: Connection) => Promise<void>
}
```

#### Styling & UI
- Use FluentUI components consistently
- Follow FluentUI design patterns
- Use CSS modules or styled-components for custom styles
- Maintain responsive design principles

## File Structure Patterns

### Backend Structure
```
internal/
├── api/           # API handlers and routes
├── controller/    # Wails app controller
├── db/           # Database setup and migrations
├── handler/      # Business logic handlers
├── manager/      # Resource managers (connection, etc.)
├── model/        # Data models and structs
├── opt/          # Options and configuration
├── s3/           # S3 client implementation
└── tool/         # Utility functions
```

### Frontend Structure
```
frontend/src/
├── api/          # API client functions
├── component/    # React components
├── hook/         # Custom React hooks
├── interfaces/   # TypeScript interfaces
├── store/        # Zustand stores
└── assets/       # Static assets
```

## Testing Guidelines

### Go Testing
- Write table-driven tests when testing multiple scenarios
- Use `t.Fatalf()` for setup failures, `t.Errorf()` for test failures
- Name tests clearly: `TestFunctionName_Scenario`
- Mock external dependencies (S3, database) in unit tests

### Frontend Testing
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock API calls in tests
- Test error states and loading states

## Common Patterns

### Error Response Pattern (Backend)
```go
type Response struct {
    Status int         `json:"status"`
    Data   interface{} `json:"data,omitempty"`
    Error  string      `json:"error,omitempty"`
}
```

### API Call Pattern (Frontend)
```typescript
const res = await Dial<{list: Connection[]}>('/api/connection/list')
if (res.status !== 200) {
    // Handle error
    return
}
// Use res.data.list
```

### Context Timeout Pattern
```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
```

## Development Notes

- The application uses Wails v2 for desktop app functionality
- S3 operations should handle network errors gracefully
- Database operations use GORM with SQLite
- Frontend uses FluentUI for consistent design
- State management via Zustand stores
- All file operations should be async and handle errors

## Debugging

- Use `log.SetLogLevel(log.LogLevelDebug)` for verbose logging
- Frontend: Use browser dev tools and React DevTools
- Backend: Use Delve debugger or simple fmt.Printf statements
- Check Wails logs for desktop-specific issues