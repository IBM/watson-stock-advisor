# watson-stock-advisor

# Provision NoSQL DB TODO add pics
    1. Navigate to console.bluemix.net
    2. Click 'Create Resource'
    3. Search for 'cloudant nosql'
    4. Select the only search result under 'Data & Analytics' called 'Cloudant NoSQL DB'
    5. Specify the settings you want
    6. Click 'Create' in the bottom right

### Configure credentials

The credentials for IBM Cloud services (Discovery), can be found in the ``Services`` menu in IBM Cloud,
by selecting the ``Service Credentials`` option for each service.

The other settings for Discovery were collected during the
earlier setup steps (``ENV_ID``).

Copy the [`env.sample`](env.sample) to `.env`.

```
$ cp env.sample .env
```
Edit the `.env` file with the necessary settings.

#### `env.sample:`

```
# Replace the credentials here with your own.
# Rename this file to .env before starting the app.

# Watson Discovery
DISCOVERY_USERNAME="XXXXXXXX"
DISCOVERY_PASSWORD="XXXXXXXXX"
DISCOVERY_VERSION="v1"
DISCOVERY_VERSION_DATE="2017-11-07"
DISCOVERY_ENV_ID="system"

# Cloudant
CLOUDANT_KEY="XXXXXXXXX"
CLOUDANT_PASSWORD="XXXXXXXXXXXXXXX"
CLOUDANT_ACCESS="XXXXXXXXXXXXXX-bluemix.cloudant.com"
DB_NAME="XXXXXXXXXX"

```