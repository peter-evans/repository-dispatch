# Repository Dispatch
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Repository%20Dispatch-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAM6wAADOsB5dZE0gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAERSURBVCiRhZG/SsMxFEZPfsVJ61jbxaF0cRQRcRJ9hlYn30IHN/+9iquDCOIsblIrOjqKgy5aKoJQj4O3EEtbPwhJbr6Te28CmdSKeqzeqr0YbfVIrTBKakvtOl5dtTkK+v4HfA9PEyBFCY9AGVgCBLaBp1jPAyfAJ/AAdIEG0dNAiyP7+K1qIfMdonZic6+WJoBJvQlvuwDqcXadUuqPA1NKAlexbRTAIMvMOCjTbMwl1LtI/6KWJ5Q6rT6Ht1MA58AX8Apcqqt5r2qhrgAXQC3CZ6i1+KMd9TRu3MvA3aH/fFPnBodb6oe6HM8+lYHrGdRXW8M9bMZtPXUji69lmf5Cmamq7quNLFZXD9Rq7v0Bpc1o/tp0fisAAAAASUVORK5CYII=)](https://github.com/marketplace/actions/repository-dispatch)

A GitHub action to create a repository dispatch event.

## Usage

```yml
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v1.0.0
        with:
          token: ${{ secrets.REPO_ACCESS_TOKEN }}
          event-type: my-event
```

## Parameters

- `token` (**required**) - A `repo` scoped GitHub [Personal Access Token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line).
- `repository` - The full name of the repository to send the dispatch. Defaults to the current repository.
- `event-type` (**required**) - A custom webhook event name.
- `client-payload` - JSON payload with extra information about the webhook event that your action or worklow may use. Default: {}

## Example

Here is an example setting all of the input parameters.

```yml
      - name: Repository Dispatch
        uses: peter-evans/repository-dispatch@v1.0.0
        with:
          token: ${{ secrets.REPO_ACCESS_TOKEN }}
          repository: username/my-repo
          event-type: my-event
          client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

Here is an example `on: repository_dispatch` workflow to receive the event.

```yml
name: Repository Dispatch
on:
  repository_dispatch:
    types: [my-event]
jobs:
  autopep8:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
        with:
          ref: ${{ github.event.client_payload.ref }}
      - run: echo ${{ github.event.client_payload.sha }}
```

## License

[MIT](LICENSE)
