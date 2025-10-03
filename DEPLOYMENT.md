# SamudraSetu Deployment Guide

This guide covers deploying the SamudraSetu platform to various cloud providers.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project**: Set up and configured with the database schema
2. **API Keys**: All required API keys for external services
3. **Domain**: A domain name for your application (optional but recommended)
4. **SSL Certificate**: For HTTPS (handled automatically by most platforms)

### Required API Keys

- **Supabase**: Project URL, anon key, service role key
- **Mapbox**: Access token for maps
- **Social Media**: Twitter, YouTube, Facebook API keys
- **Notifications**: Twilio, SendGrid, Firebase keys
- **Official Data**: NOAA API key

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/samudra-setu.git
cd samudra-setu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapping Configuration
# No mapping API key needed - using free OpenStreetMap!

# Social Media API Keys
TWITTER_API_KEY=your_twitter_api_key
YOUTUBE_API_KEY=your_youtube_api_key
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Notification Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER_EMAIL=your_sendgrid_sender_email

# Firebase (for push notifications)
FIREBASE_SERVER_KEY=your_firebase_server_key

# Official Data APIs
NOAA_API_KEY=your_noaa_api_key
```

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Follow the prompts to configure your project.

### 4. Set Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the environment variables from your `.env.local` file

### 5. Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## Docker Deployment

### 1. Build the Docker Image

```bash
docker build -t samudra-setu .
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

### 3. Configure Environment Variables

Create a `.env` file with your environment variables:

```bash
cp .env.local .env
```

### 4. SSL Certificate (Production)

For production, you'll need SSL certificates:

```bash
# Create SSL directory
mkdir ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem

# For production, use Let's Encrypt or a commercial certificate
```

## AWS Deployment

### 1. Using AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
3. Set environment variables in Amplify console
4. Deploy

### 2. Using AWS ECS with Fargate

1. Build and push Docker image to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure Application Load Balancer
5. Set up auto-scaling

### 3. Using AWS Lambda (Serverless)

1. Install serverless framework:
   ```bash
   npm install -g serverless
   npm install serverless-nextjs-plugin
   ```

2. Create `serverless.yml`:
   ```yaml
   service: samudra-setu
   
   plugins:
     - serverless-nextjs-plugin
   
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
   
   custom:
     nextjs:
       nextConfigDir: ./
   ```

3. Deploy:
   ```bash
   serverless deploy
   ```

## Monitoring and Maintenance

### 1. Health Checks

The application includes health check endpoints:

- `/api/health` - Basic health check
- `/api/status` - Detailed system status

### 2. Logging

Configure logging for different environments:

```javascript
// lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 3. Performance Monitoring

Consider integrating:

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring

### 4. Database Monitoring

Monitor your Supabase database:

1. Check query performance in Supabase dashboard
2. Monitor connection usage
3. Set up alerts for high usage
4. Regular backup verification

### 5. Security Monitoring

1. **Rate Limiting**: Configure appropriate rate limits
2. **DDoS Protection**: Use CloudFlare or similar service
3. **Security Headers**: Ensure all security headers are set
4. **Regular Updates**: Keep dependencies updated
5. **Vulnerability Scanning**: Regular security scans

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Build fails during deployment

**Solutions**:
- Check Node.js version compatibility
- Verify all environment variables are set
- Check for TypeScript errors
- Ensure all dependencies are installed

#### 2. Database Connection Issues

**Problem**: Cannot connect to Supabase

**Solutions**:
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies
- Check database status in Supabase dashboard

#### 3. Map Not Loading

**Problem**: Mapbox maps not displaying

**Solutions**:
- Verify Mapbox access token
- Check domain restrictions in Mapbox account
- Verify API quota and billing

#### 4. Social Media APIs Not Working

**Problem**: Social media data not being fetched

**Solutions**:
- Verify API keys and permissions
- Check rate limits
- Verify webhook configurations
- Check API service status

#### 5. Notifications Not Sending

**Problem**: SMS/Email notifications not working

**Solutions**:
- Verify Twilio/SendGrid credentials
- Check account status and billing
- Verify phone numbers and email addresses
- Check rate limits

### Performance Issues

#### 1. Slow Page Loads

**Solutions**:
- Enable Next.js optimizations
- Use CDN for static assets
- Optimize images
- Implement caching strategies
- Monitor bundle size

#### 2. Database Performance

**Solutions**:
- Add appropriate indexes
- Optimize queries
- Use connection pooling
- Monitor query performance
- Consider read replicas for heavy read workloads

#### 3. API Rate Limits

**Solutions**:
- Implement request queuing
- Use caching for frequently requested data
- Implement exponential backoff
- Consider upgrading API plans

### Security Issues

#### 1. Authentication Problems

**Solutions**:
- Verify Supabase auth configuration
- Check JWT token expiration
- Verify redirect URLs
- Check user permissions

#### 2. Data Leaks

**Solutions**:
- Review RLS policies
- Audit user permissions
- Check API endpoints for proper authorization
- Monitor access logs

## Scaling Considerations

### 1. Horizontal Scaling

- Use load balancers
- Implement session storage (Redis)
- Use CDN for static assets
- Consider microservices architecture

### 2. Database Scaling

- Use read replicas
- Implement database sharding
- Use connection pooling
- Consider database clustering

### 3. Caching Strategy

- Implement Redis for session storage
- Use CDN for static assets
- Cache API responses
- Implement database query caching

## Backup and Recovery

### 1. Database Backups

- Enable automatic backups in Supabase
- Test backup restoration regularly
- Store backups in multiple locations
- Document recovery procedures

### 2. Application Backups

- Version control all code
- Backup configuration files
- Document deployment procedures
- Test disaster recovery procedures

## Support and Maintenance

### 1. Regular Maintenance

- Update dependencies monthly
- Review security patches
- Monitor performance metrics
- Clean up old data

### 2. Monitoring

- Set up alerts for critical issues
- Monitor error rates
- Track user engagement
- Monitor API usage

### 3. Documentation

- Keep deployment docs updated
- Document configuration changes
- Maintain troubleshooting guides
- Update API documentation

For additional support, contact the development team or refer to the project documentation.
