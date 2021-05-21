# Delete Artifacts

### An action that deletes artifacts associated with given workflow and commit or other criteria.
Based on [dawidd6/action-download-artifact](https://github.com/dawidd6/action-download-artifact)

## Usage
> If commit or pr or branch or run_id or workflow_conclusion is not specified then the artifact from the most recent successfully completed workflow run will be downloaded.

**Do not specify pr, commit, branch, run_id together or workflow_conclusion and run_id together. Pick just one of each or none.**
```yml
- name: Delete artifacts
  uses: riskledger/delete-artifacts@v1
  with:
    # Optional, GitHub token
    github_token: ${{secrets.GITHUB_TOKEN}}
    # Required, workflow file name or ID
    workflow: workflow_name.yml
    # Optional, the status or conclusion of a completed workflow to search for
    # Can be one of a workflow conclusion::
    # "failure", "success", "neutral", "cancelled", "skipped", "timed_out", "action_required"
    # Or a workflow status:
    # "completed", "in_progress", "queued"
    # Default: "completed,success"
    workflow_conclusion: success
    # Optional, will get head commit SHA
    pr: ${{github.event.pull_request.number}}
    # Optional, no need to specify if PR is
    commit: ${{github.event.pull_request.head.sha}}
    # Optional, will use the branch
    branch: master
    # Optional, defaults to all types
    event: push
    # Optional, will use specified workflow run
    run_id: 1122334455
    # Optional, run number from the workflow
    run_number: 34
    # Optional, uploaded artifact name,
    # will download all artifacts if not specified
    # and extract them in respective subdirectories
    # https://github.com/actions/download-artifact#download-all-artifacts
    name: artifact_name
    # Optional, defaults to current repo
    repo: ${{github.repository}}
```
