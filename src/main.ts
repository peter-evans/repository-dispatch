import * as core from '@actions/core'
import * as github from '@actions/github'
import {inspect} from 'util'

type Repo = {
  owner: string
  repo: string
}

const orgOwner = github.context.repo.owner

function splitRepoString(repoStr: string): Repo {
  const [owner, repo] = repoStr.split('/')
  if (repo) {
    return {
      owner: owner,
      repo: repo
    }
  }

  return {
    owner: orgOwner,
    repo: owner
  }
}

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      repositories: core.getInput('repositories'),
      eventType: core.getInput('event-type'),
      clientPayload: core.getInput('client-payload')
    }
    core.debug(`Inputs: ${inspect(inputs)}`)

    const repositories: Repo[] = []

    if (inputs.repositories) {
      repositories.push(
        ...inputs.repositories
          .replace(/\r/g, '')
          .split('\n')
          .map(input => splitRepoString(input))
      )
    } else if (inputs.repository) {
      const repo = splitRepoString(inputs.repository)
      repositories.push(repo)
    } else {
      repositories.push(github.context.repo)
    }

    const octokit = github.getOctokit(inputs.token)

    await Promise.all(
      repositories.map(async repo => {
        await octokit.repos.createDispatchEvent({
          ...repo,
          event_type: inputs.eventType,
          client_payload: JSON.parse(inputs.clientPayload)
        })
      })
    )
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
