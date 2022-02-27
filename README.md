# Heroku Config - GitHub Action

A simple action to set config values in Heroku app.

## How to use it

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set Heroku config
        uses: Summ-Technologies/heroku-config@v1.0.0 # use the latest version of the action
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "<app-name>"
          envfile_path: "/path/to" # path to env file relative to root of directory (leading / is optional)
```

|    Variables    |   Description   | Required |
| :-------------: | :-------------: | :------: |
| heroku_api_key  | Heroku API Key  |    ✅    |
| heroku_app_name | Heroku App Name |    ✅    |
|  envfile_path   | Path to envfile |    ✅    |
