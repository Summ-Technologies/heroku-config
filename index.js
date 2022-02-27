const core = require("@actions/core");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");

function heroku(command) {
  const herokuApiKey = core.getInput("heroku_api_key");
  return `HEROKU_API_KEY=${herokuApiKey} heroku ${command}`;
}

async function loginHeroku() {
  try {
    let loggedInUser = await exec(heroku("auth:whoami"));
    console.log(`${loggedInUser.stdout.trim()} logged in successfully ✅`);
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
      heroku(`config:get --app ${herokuAppName} ${envVarKey}`)
    );
    let existingValue = existingValueOutput.stdout.trim();
    if (existingValue !== envVarValue) {
      changedEnvVars.push(`${envVarKey}=${envVarValue}`);
    }
  }
  if (changedEnvVars.length > 0) {
    try {
      await exec(
        heroku(`config:set --app ${herokuAppName} ${changedEnvVars.join(" ")}`)
      );
      console.log(
        `Successfully set new config values: ${changedEnvVars
          .map((v) => v.split("=")[0])
          .join(", ")}`
      );
    } catch (error) {
      throw Error(`Failure setting config values. Error: ${error.message}`);
    }
  } else {
    console.log("No config values were changed.");
  }
}

loginHeroku()
  .then(() => setHerokuConfig())
  .catch((error) => {
    console.log(error.message);
    core.setFailed(error.message);
  });
