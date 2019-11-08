const { inspect } = require("util");
const core = require("@actions/core");
const { request } = require("@octokit/request");

async function run() {
  try {
    const inputs = {
      token: core.getInput("token"),
      repository: core.getInput("repository"),
      eventType: core.getInput("event-type"),
      clientPayload: core.getInput("client-payload")
    };
    core.debug(`Inputs: ${inspect(inputs)}`);

    const repository = inputs.repository ? inputs.repository : process.env.GITHUB_REPOSITORY;
    core.debug(`repository: ${repository}`);

    const clientPayload = inputs.clientPayload ? inputs.clientPayload : '{}';
    core.debug(`clientPayload: ${clientPayload}`);

    await request(
      `POST /repos/${repository}/dispatches`,
      {
        headers: {
          authorization: `token ${inputs.token}`
        },
        mediaType: {
          previews: ['everest']
        },
        event_type: `${inputs.eventType}`,
        client_payload: JSON.parse(clientPayload),
      }
    );
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

run();
