# Repository Dispatch
[![CI](https://github.com/peter-evans/repository-dispatch/workflows/CI/badge.svg)](https://github.com/peter-evans/repository-dispatch/actions?query=workflow%3ACI)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Repository%20Dispatch-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAM6wAADOsB5dZE0gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVCiRhZG/SsMxFEZPfsVJ61jbxaF0cRQRcRJ9hlYn30IHN/+9iquDCOIsblIrOjqKgy5aKoJQj4O3EEtbPwhJbr6Te28CmdSKeqzeqr0YbfVIrTBKakvtOl5dtTkK+v4HfA9PEyBFCY9AGVgCBLaBp1jPAyfAJ/AAdIEG0dNAiyP7+K1qIfMdonZic6+WJoBJvQlvuwDqcXadUuqPA1NKAlexbRTAIMvMOCjTbMwl1LtI/6KWJ5Q6rT6Ht1MA58AX8Apcqqt5r2qhrgAXQC3CZ6i1+KMd9TRu3MvA3aH/fFPnBodb6oe6HM8+lYHrGdRXW8M9bMZtPXUji69lmf5Cmamq7quNLFZXD9Rq7v0Bpc1o/tp0fisAAAAASUVORK5CYII=)](https://github.com/marketplace/actions/repository-dispatch)

A GitHub action to create a repository dispatch event.

## Usage

Dispatch an event to the current repository.
```yml
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v2
        with:
          event-type: my-event
```

Dispatch an event to a remote repository using a `repo` scoped [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
```yml
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.PAT }}
          repository: username/my-repo
          event-type: my-event
```

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` (permissions `contents: write`) or a `repo` scoped [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). See [token](#token) for further details. | `GITHUB_TOKEN` |
| `repository` | The full name of the repository to send the dispatch. | `github.repository` (current repository) |
| `event-type` | (**required**) A custom webhook event name. | |
| `client-payload` | JSON payload with extra information about the webhook event that your action or workflow may use. | `{}` |

#### Token

This action creates [`repository_dispatch`](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) events.
The default `GITHUB_TOKEN` token can only be used if you are dispatching the same repository that the workflow is executing in.

To dispatch to a remote repository you must create a [Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `repo` scope and store it as a secret.
If you will be dispatching to a public repository then you can use the more limited `public_repo` scope.

## Example

Here is an example setting all of the input parameters.

```yml
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.PAT }}
          repository: username/my-repo
          event-type: my-event
          client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

Here is an example `on: repository_dispatch` workflow to receive the event.
Note that repository dispatch events will only trigger a workflow run if the workflow is committed to the default branch.

```yml
name: Repository Dispatch
on:
  repository_dispatch:
    types: [my-event]
jobs:
  myEvent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.client_payload.ref }}
      - run: echo ${{ github.event.client_payload.sha }}
```

### Dispatch to multiple repositories

You can dispatch to multiple repositories by using a [matrix strategy](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstrategymatrix). In the following example, after the `build` job succeeds, an event is dispatched to three different repositories.

```yml
jobs:
  build:
    # Main workflow job that builds, tests, etc.

  dispatch:
    needs: build
    strategy:
      matrix:
        repo: ['my-org/repo1', 'my-org/repo2', 'my-org/repo3']
    runs-on: ubuntu-latest
    steps:
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.PAT }}
          repository: ${{ matrix.repo }}
          event-type: my-event
```

## Client payload

The GitHub API allows a maximum of 10 top-level properties in the `client-payload` JSON.
If you use more than that you will see an error message like the following.

```
No more than 10 properties are allowed; 14 were supplied.
```

For example, this payload will fail because it has more than 10 top-level properties.

```yml
client-payload: ${{ toJson(github) }}
```

To solve this you can simply wrap the payload in a single top-level property.
The following payload will succeed.

```yml
client-payload: '{"github": ${{ toJson(github) }}}'
```

Additionally, there is a limitation on the total data size of the `client-payload`. A very large payload may result in a `client_payload is too large` error.

## License

[MIT](LICENSE)
