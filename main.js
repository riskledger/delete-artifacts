const core = require('@actions/core')
const github = require('@actions/github')

async function main() {
  try {
    const token = core.getInput("github_token", { required: true })
    const workflow = core.getInput("workflow", { required: true })
    const [owner, repo] = core.getInput("repo", { required: true }).split("/")
    const name = core.getInput("name")
    let workflowConclusion = core.getInput("workflow_conclusion")
    let pr = core.getInput("pr")
    let commit = core.getInput("commit")
    let branch = core.getInput("branch")
    let event = core.getInput("event")
    let runID = core.getInput("run_id")
    let runNumber = core.getInput("run_number")

    const client = github.getOctokit(token)

    console.log("==> Workflow:", workflow)

    console.log("==> Repo:", owner + "/" + repo)

    console.log("==> Conclusion:", workflowConclusion)

    if (pr) {
      console.log("==> PR:", pr)

      const pull = await client.pulls.get({
          owner: owner,
          repo: repo,
          pull_number: pr,
      })
      commit = pull.data.head.sha
    }

    if (commit) {
      console.log("==> Commit:", commit)
    }

    if (branch) {
      branch = branch.replace(/^refs\/heads\//, "")
      console.log("==> Branch:", branch)
    }

    if (event) {
      console.log("==> Event:", event)
    }

    if (runNumber) {
        console.log("==> RunNumber:", runNumber)
    }

    if (!runID) {
      for await (const runs of client.paginate.iterator(client.rest.actions.listWorkflowRuns, {
          owner: owner,
          repo: repo,
          workflow_id: workflow,
          branch: branch,
          event: event,
          status: workflowConclusion,
      }
      )) {
        const run = runs.data.find(r => {
            if (commit) {
                return r.head_sha == commit
            }
            if (runNumber) {
                return r.run_number == runNumber
            }
            return true
        })

        if (run) {
            runID = run.id
            break
        }
      }
    }

    console.log("==> RunID:", runID)

    let artifacts = await client.rest.actions.listWorkflowRunArtifacts({
      owner: owner,
      repo: repo,
      run_id: runID,
    })

    // One artifact or all if `name` input is not specified.
    if (name) {
      artifacts = artifacts.data.artifacts.filter((artifact) => {
          return artifact.name == name
      })
    } else {
      artifacts = artifacts.data.artifacts
    }

    if (artifacts.length == 0)
      throw new Error("no artifacts found")

    for (const artifact of artifacts) {
        console.log("==> Artifact:", artifact.id)

        console.log(`==> Deleting: ${artifact.name}`)

        await client.rest.actions.deleteArtifact({
            owner: owner,
            repo: repo,
            artifact_id: artifact.id,
        })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
