import * as core from '@actions/core'
import * as github from '@actions/github'
import {inspect} from 'util'

async function run(): Promise<void> {
  try {
    core.warning(`This action's default branch has been renamed to "main"`)
    core.warning(
      `Referencing this action with "@master" is deprecated and will stop working after June 30th 2021`
    )

    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      eventType: core.getInput('event-type'),
      clientPayload: core.getInput('client-payload')
    }
    core.debug(`Inputs: ${inspect(inputs)}`)

    const [owner, repo] = inputs.repository.split('/')

    const octokit = github.getOctokit(inputs.token)

    await octokit.repos.createDispatchEvent({
      owner: owner,
      repo: repo,
      event_type: inputs.eventType,
      client_payload: JSON.parse(inputs.clientPayload)
    })
  } catch (error) {
    core.debug(inspect(error))
    if (error.status == 404) {
      core.setFailed(
        'Repository not found, OR token has insufficient permissions.'
      )
    } else {
      core.setFailed(error.message)
    }
  }
}

run()
