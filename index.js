const core = require("@actions/core");
const fs = require("fs");
const exec = promisify(require("child_process").exec);

async function loginHeroku() {
  const herokuApiKey = core.getInput("heroku_api_key");
  try {
    await exec(`export HEROKU_API_KEY=${herokuApiKey}`);
    let loggedInUser = await exec(`heroku auth:whoami`);
    console.log(`${loggedInUser} logged in successfully ✅`);
  } catch (error) {
    throw Error(`Authentication process failed. Error: ${error.message}`);
  }
}

async function setHerokuConfig() {
  const herokuAppName = core.getInput("heroku_app_name");
  const _envFilePath = core.getInput("envfile_path");
  // Remove leading ./ or / in path
  const envFilePath =
    _envFilePath.slice(0, 2) === "./"
      ? _envFilePath.slice(2)
      : _envFilePath[0] === "/"
      ? _envFilePath.slice(1)
      : _envFilePath;
  const envFileContents = fs.readFileSync(envFilePath, "utf8");
  const envVars = require("dotenv").parse(envFileContents);
  let changedEnvVars = [];
  for (let envVarKey in envVars) {
    let envVarValue = envVars[envVarKey];
    let existingValueOutput = await exec(
      `heroku config:get --app ${herokuAppName} ${envVarKey}`
    );
    let existingValue = existingValueOutput.stdout.trim();
    if (existingValue !== envVarValue) {
      console.log(`Updating new value for: ${envVarKey}`);
      changedEnvVars.push(`${envVarKey}=${envVarValue}`);
    }
  }
  if (changedEnvVars.length > 0) {
    try {
      await exec(
        `heroku config:set --app ${herokuAppName} ${changedEnvVars.join(" ")} `
      );
      console.log(
        `Successfully set new config values: ${changedEnvVars
          .map((v) => v.split("=")[0])
          .join(", ")}`
      );
    } catch (error) {
      throw Error(`Failure setting config values. Error: ${error.message}`);
    }
  }
}

loginHeroku()
  .then(() => setHerokuConfig())
  .catch((error) => {
    console.log(error.message);
    core.setFailed(error.message);
  });
