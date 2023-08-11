import * as core from '@actions/core'
import * as github from '@actions/github'
import {inspect} from 'util'

/* eslint-disable  @typescript-eslint/no-explicit-any */
function hasErrorStatus(error: any): error is {status: number} {
  return typeof error.status === 'number'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      eventType: core.getInput('event-type'),
      clientPayload: core.getInput('client-payload')
    }
    core.debug(`Inputs: ${inspect(inputs)}`)

    const [owner, repo] = inputs.repository.split('/')

    const octokit = github.getOctokit(inputs.token)

    await octokit.rest.repos.createDispatchEvent({
      owner: owner,
      repo: repo,
      event_type: inputs.eventType,
      client_payload: JSON.parse(inputs.clientPayload)
    })
  } catch (error) {
    core.debug(inspect(error))
    if (hasErrorStatus(error) && error.status == 404) {
      core.setFailed(
        'Repository not found, OR token has insufficient permissions.'
      )
    } else {
      core.setFailed(getErrorMessage(error))
    }
  }
}

run()
