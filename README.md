# @onivoro/onix

A comprehensive Nx plugin providing executors for building, testing, and deploying applications across various platforms including AWS Lambda, ECS, S3, and local development environments.

## Installation

```bash
npm install @onivoro/onix
```

## Executors

### build-cli

Builds CLI applications.

**Schema:** No configuration options required.

**Example usage:**
```json
{
  "targets": {
    "package-cli": {
      "executor": "@onivoro/onix:build-cli"
    }
  }
}
```

**Command:**
```bash
nx package-cli my-project
```

---

### typeorm

Executes TypeORM migrations and database operations.

**Configuration Options:**
- `runOrRevert` (string): TypeORM CLI command: 'run' or 'revert'
- `envFile` (string, required): Path and name of the .env file to load
- `ormConfigPath` (string, required): Path and name of the ormconfig

**Example usage:**
```json
{
  "targets": {
    "migrate": {
      "executor": "@onivoro/onix:typeorm",
      "options": {
        "runOrRevert": "run",
        "envFile": ".env",
        "ormConfigPath": "ormconfig.json"
      }
    },
    "migrate-revert": {
      "executor": "@onivoro/onix:typeorm",
      "options": {
        "runOrRevert": "revert",
        "envFile": ".env",
        "ormConfigPath": "ormconfig.json"
      }
    }
  }
}
```

**Command:**
```bash
nx migrate my-project
nx migrate-revert my-project
```

---

### docker-run

Runs Docker containers locally with environment configuration.

**Configuration Options:**
- `envFile` (string, required): Path and name of the .env file to load
- `ecr` (string, required): Name of the ECR repository and tag (conventionally separated by a colon)
- `port` (number, required): Docker port to bind to localhost

**Example usage:**
```json
{
  "targets": {
    "docker-run": {
      "executor": "@onivoro/onix:docker-run",
      "options": {
        "envFile": ".env.local",
        "ecr": "my-app:latest",
        "port": 3000
      }
    }
  }
}
```

**Command:**
```bash
nx docker-run my-project
```

---

### deploy-lambda

Deploys AWS Lambda functions with configurable runtime and environment settings.

**Configuration Options:**
- `bucket` (string, required): Name of the S3 bucket to use for uploading Lambda artifacts
- `region` (string, required): AWS region
- `roleArn` (string, required): AWS IAM role ARN the Lambda will assume
- `functionName` (string): Name to use for lambda. Defaults to context.projectName
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `runtime` (string): NodeJS runtime version
- `handler` (string): Lambda handler resolution expression. Defaults to main.handler
- `memorySize` (number): Lambda allocated memory in MB
- `delayMs` (number): Delay in millis to wait after creating the Lambda
- `environment` (object): Environment variables structured as an object

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-lambda",
      "options": {
        "bucket": "my-lambda-deployments",
        "region": "us-east-1",
        "roleArn": "arn:aws:iam::123456789012:role/lambda-execution-role",
        "runtime": "nodejs18.x",
        "handler": "main.handler",
        "memorySize": 256,
        "environment": {
          "NODE_ENV": "production",
          "LOG_LEVEL": "info"
        }
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-lambda
```

---

### deploy-ecs

Builds and deploys Docker images to AWS ECS services.

**Configuration Options:**
- `ecr` (string, required): Name of the ECR repository and tag (conventionally separated by a colon)
- `dockerfile` (string, required): Path and name of the Dockerfile
- `platform` (string): The platform argument for running the Docker build (example 'linux/amd64')
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `ui` (string): Name of the web/UI project to include in the assets
- `cluster` (string): AWS cluster for identifying the ECS service to redeploy
- `region` (string): AWS region for identifying the ECS service to redeploy
- `service` (string): AWS service for identifying the ECS service to redeploy

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-ecs",
      "options": {
        "ecr": "my-app:latest",
        "dockerfile": "Dockerfile",
        "platform": "linux/amd64",
        "cluster": "my-cluster",
        "region": "us-east-1",
        "service": "my-service",
        "ui": "my-frontend"
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-api
```

---

### deploy-s3

Deploys static assets to AWS S3.

**Configuration Options:**
- `bucket` (string, required): Name of the S3 bucket to use for uploading artifacts
- `region` (string, required): AWS region
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `prefix` (string): The prefix for S3 upload within the specified bucket
- `omitAcl` (boolean): Whether to use acl public-read for S3 push

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-s3",
      "options": {
        "bucket": "my-static-assets",
        "region": "us-east-1",
        "prefix": "app/v1/",
        "omitAcl": false
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-static-site
```

---

### deploy-s3-react

Deploys React applications to AWS S3 with versioning support.

**Configuration Options:**
- `bucket` (string, required): Name of the S3 bucket to use for uploading artifacts
- `region` (string, required): AWS region
- `version` (string, required): Version identifier for the deployment
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `omitAcl` (boolean): Whether to use acl public-read for S3 push

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-s3-react",
      "options": {
        "bucket": "my-react-app",
        "region": "us-east-1",
        "version": "1.0.0",
        "omitAcl": false
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-react-app
```

---

### deploy-s3-sync

Synchronizes local directories with S3 buckets and optionally invalidates CloudFront distributions.

**Configuration Options:**
- `bucket` (string, required): Name of the S3 bucket to use for uploading artifacts
- `region` (string, required): AWS region
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `omitAcl` (boolean): Whether to use acl public-read for S3 push
- `localDirectory` (string): Local directory to upload to S3
- `cloudFrontId` (string): CloudFront distribution ID for invalidation
- `cloudFrontRegion` (string): CloudFront region (defaults to us-east-1)
- `env` (object): Object that provides keys and values to load as environment variables

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-s3-sync",
      "options": {
        "bucket": "my-website",
        "region": "us-east-1",
        "localDirectory": "dist",
        "cloudFrontId": "E1234567890123",
        "cloudFrontRegion": "us-east-1",
        "env": {
          "NODE_ENV": "production"
        }
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-website
```

---

### deploy-s3-vite

Deploys Vite applications to AWS S3 with versioning support.

**Configuration Options:**
- `bucket` (string, required): Name of the S3 bucket to use for uploading artifacts
- `region` (string, required): AWS region
- `version` (string, required): Version identifier for the deployment
- `profile` (string): AWS profile name (from ~/.aws/credentials)
- `omitAcl` (boolean): Whether to use acl public-read for S3 push

**Example usage:**
```json
{
  "targets": {
    "deploy": {
      "executor": "@onivoro/onix:deploy-s3-vite",
      "options": {
        "bucket": "my-vite-app",
        "region": "us-east-1",
        "version": "2.1.0",
        "omitAcl": false
      }
    }
  }
}
```

**Command:**
```bash
nx deploy my-vite-app
```

---

### openapi-gen

Generates client code from OpenAPI specifications.

**Configuration Options:**
- `openapiJsonPath` (string, required): Path to the openapi definition JSON file (or yml file)
- `outputPath` (string, required): Path where the output of the openapi will be written
- `flavor` (string): Lowercase identifier corresponding to one of the predefined openapi generator target formats. Defaults to 'typescript-axios'

**Example usage:**
```json
{
  "targets": {
    "generate-client": {
      "executor": "@onivoro/onix:openapi-gen",
      "options": {
        "openapiJsonPath": "src/api/openapi.json",
        "outputPath": "src/generated/api",
        "flavor": "typescript-axios"
      }
    }
  }
}
```

**Command:**
```bash
nx generate-client my-api
```

---

### local

Serves applications locally with optional debugging support and S3 file copying capabilities.

**Configuration Options:**
- `debugPort` (number): Debug port for Node.js debugging
- `envFile` (string): Path and name of the .env file to load
- `copyFromS3` (object): Configuration for copying files from S3 before serving
  - `profile` (string): AWS profile name (from ~/.aws/credentials)
  - `files` (object): Key-value pairs where keys are S3 paths and values are local file paths

**Features:**
- Loads environment variables from specified `.env` file
- Optionally copies files from AWS S3 to local filesystem before serving
- Supports Node.js debugging with configurable debug port
- Integrates with the project's existing development target

**Example usage:**
```json
{
  "targets": {
    "start-local": {
      "executor": "@onivoro/onix:local",
      "options": {
        "debugPort": 9229,
        "envFile": ".env.local"
      }
    },
    "start-with-s3": {
      "executor": "@onivoro/onix:local",
      "options": {
        "envFile": ".env.local",
        "copyFromS3": {
          "profile": "dev-profile",
          "files": {
            "s3://my-bucket/config/app.json": "./config/app.json",
            "my-bucket/data/sample.csv": "~/Downloads/sample.csv"
          }
        }
      }
    }
  }
}
```

**S3 Path Formats:**
- Full S3 URI: `s3://bucket-name/path/to/file`
- Bucket-relative path: `bucket-name/path/to/file`

**Local Path Features:**
- Supports `~` expansion to home directory
- Creates directories recursively if they don't exist
- Overwrites existing files

**Command:**
```bash
# Basic local start
nx start-local my-project

# Start with S3 file copying
nx start-with-s3 my-project
```

---

### xray

AWS X-Ray tracing executor.

**Schema:** No configuration options required.

**Example usage:**
```json
{
  "targets": {
    "trace": {
      "executor": "@onivoro/onix:xray"
    }
  }
}
```

**Command:**
```bash
nx trace my-project
```

---

### playwright

Runs Playwright end-to-end tests.

**Configuration Options:**
- `envFile` (string): Path and name of the .env file to load

**Example usage:**
```json
{
  "targets": {
    "e2e": {
      "executor": "@onivoro/onix:playwright",
      "options": {
        "envFile": ".env.test"
      }
    }
  }
}
```

**Command:**
```bash
nx e2e my-project
```

## Common Patterns

### Environment Files
Many executors support loading environment variables from `.env` files. This is useful for managing different configurations across environments:

```bash
# .env.local
DATABASE_URL=postgresql://localhost:5432/myapp
API_KEY=dev-key-123

# .env.production
DATABASE_URL=postgresql://prod-server:5432/myapp
API_KEY=prod-key-456
```

### AWS Configuration
For AWS-related executors, you can either:
1. Use AWS profile names (configured in `~/.aws/credentials`)
2. Set AWS credentials as environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

### Multi-target Projects
You can define multiple targets for different environments:

```json
{
  "targets": {
    "deploy:dev": {
      "executor": "@onivoro/onix:deploy-lambda",
      "options": {
        "bucket": "my-app-dev",
        "region": "us-east-1",
        "roleArn": "arn:aws:iam::123456789012:role/lambda-dev-role"
      }
    },
    "deploy:prod": {
      "executor": "@onivoro/onix:deploy-lambda",
      "options": {
        "bucket": "my-app-prod",
        "region": "us-east-1",
        "roleArn": "arn:aws:iam::123456789012:role/lambda-prod-role"
      }
    }
  }
}
```

Then run with:
```bash
nx deploy:dev my-project
nx deploy:prod my-project
```
