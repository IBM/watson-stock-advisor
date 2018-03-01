# Watson Stock Advisor

## Provision NoSQL DB TODO add pics
    1. Navigate to console.bluemix.net
    2. Click 'Create Resource'
    3. Search for 'cloudant nosql'
    4. Select the only search result under 'Data & Analytics' called 'Cloudant NoSQL DB'
    5. Specify the settings you want
    6. Click 'Create' in the bottom right

## Web Portal

The web page is adapted from a [template](https://startbootstrap.com/template-overviews/sb-admin/ "Start Boostrap SB Admin") from [Start Bootstrap](https://startbootstrap.com/ "Start Bootstrap") by [Blackrock Digital](https://github.com/BlackrockDigital "Blackrock Digital").
You can find the repository for the template [here](https://github.com/BlackrockDigital/startbootstrap-sb-admin "SB Admin Repo"), including its [License](https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE "SB Admin License").


### Configure credentials

The credentials for IBM Cloud services (Discovery), can be found in the ``Services`` menu in IBM Cloud,
by selecting the ``Service Credentials`` option for each service.

The other settings for Discovery were collected during the
earlier setup steps (``ENV_ID``).

Navigate to the web directory and Copy the [`env.sample`](env.sample) to `.env`.

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

# App Config
MAX_COMPANIES=20
MAX_ARTICLES_PER_COMPANY=100

```

### Run the portal

In the web directory, run

```
$ npm install
$ bower install
$ npm start
```
The portal should now be accessible on port 8080 (or another port specified by PORT in .env)
