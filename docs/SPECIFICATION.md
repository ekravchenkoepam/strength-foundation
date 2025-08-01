# Specification for the project

This is a non-formal gathering of all project related info.

The whole project consists from two main parts:

- `Admin Website`: Headless CMS website to manage and store data.
- `Client Website`: A client website publicly available for all users.

## Architecture

### 1. Admin Website

- BE part of the application with UI part for editing data.
- It is based on the Strapi/Contentful Headless CMS.
- Headless CMS provides an easy way to manipulate the data and manage website content.

#### 1.1 Requirements

1. It has `UK` and `EN` locales. The default locale is `UK`, it has to support it.
2. Different types of contetn:
   - `YouTube` links.
   - Images
   - Other document-like files (PDF, Excel, etc)
   - Text Blocks
   - 3D-renderings ???
3. Two-factor authentication for admins. It is not publicly available.

#### 1.2 Admin Website Required Services

1. **A Server** to run Admin Website
   - "sleeps" most of the time, wakes up on demand.
2. **SQL database** with all data stored.
   - This DB is managed by Headless CMS.
3. **A lambda function** to run Client website redeploy.
   - When data changes through Admin Website, we have to rebuild and redeploy the Client website.
4. **A bucket(s)** to store media content.
   - static images which don't change often.
   - new images added by admins.
   - PDF and other document-like files.
5. **A Cloud Build console** to build and deploy application.

### 2. Client Website

- A publicly available website.
- Takes data from Admin Website.

#### 2.2 Requirements

1. It is protected from DDOS attacks.
2. It doesn't have any kind of authorization or other restrictions.

#### 2.3 Client Website required services

1. **A Server** or a **CDN** to run Client Website
   - it is always awake.
   - it is protected from DDOS attacks.
   - it is publicly available
2. **A Cloud Build/Deploy console** to build and deploy application.
3. Gets all the data from the Admin Website.

### 3. Deployment

#### 3.1 Client Website: Deployment options

You can do one thing in several ways, so there are several options how you can deploy a Next.js application to the AWS.
Here you can find all the options we found so far.

1. EC2 instance where everything is stored. Basically it is a virtual machine where everything is running.
2. **(Preferable)** When it is static:
   - **S3**: Data Storage. Potentailly it should be covered by S3 for the Admin Website.
   - **Cloudfront**: CDN
   - **Route 53**: DNS
   - **Certificate Manager**: Certificates Manager for HTTPS/TLS.
   - **A Cloud Build console** to build and deploy application.

**Materials**

- [Reddit: Cheapest way to deploy a next js application on aws?](https://www.reddit.com/r/nextjs/comments/1dfrrkh/cheapest_way_to_deploy_a_next_js_application_on/)
- [Reddit: What is your preferred way of deploying a NextJS production-ready application in AWS?](https://www.reddit.com/r/nextjs/comments/142zojq/what_is_your_preferred_way_of_deploying_a_nextjs/)
- [Deploying a Next.js App manually on AWS EC2: A Step-by-Step Guide](https://medium.com/@mudasirhaji/deploying-a-next-js-app-manually-on-aws-ec2-a-step-by-step-guide-58b266ff1c52)

#### 3.2 Admin website deployment options.

There is a way how Strapi documentation suggests deploying project to AWS. You can find details here: [Strapi Docs: Amazon AWS](https://docs-v3.strapi.io/developer-docs/latest/setup-deployment-guides/deployment/hosting-guides/amazon-aws.html).

###### 3.2.1 A list of required services:

1. **EC2 virtual machine**: General purpose + t2.small, General Purpose SSD (gp2).
   - Here we run Strapi. It is setup as a Node.js server, cause Strapi uses Node.js under the hood.
   - A server "sleeps" most of the time, wakes up on demand.
2. **AWS RDS Service**: service to manage databases
   - Postgre SQL database
   - This DB is managed by Headless CMS.
3. **A lambda function** to run Client website redeploy.
   - When data changes through Admin Website, we have to rebuild and redeploy the Client website.
4. **Amazon S3 bucket(s)** to store media content.
   - static images which don't change often.
   - new images added by admins.
   - PDF and other document-like files.
5. **A Cloud Build console** to build and deploy application.
6. **Route 53**: DNS
7. **Certificate Manager**: Certificates Manager for HTTPS/TLS.

#### 3.3 Full list of all required resources

All resources are marked by: `Client`, `Admin`, or `Both`.

1. **Cloudfront**: `Client`
2. **Route 53**: `Both`
3. **Certificate Manager**: `Both`.
4. **A Cloud Build console** `Both`.
4. **A Cloud Deploy console** `Both`.
5. **EC2 virtual machine**: General purpose + t2.small, General Purpose SSD (gp2). `Admin`
2. **AWS RDS Service**: Postgre SQL database `Admin`
3. **A lambda function** to run Client website redeploy. `Admin`
4. **Amazon S3 bucket(s)** to store media content. `Admin`
