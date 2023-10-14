import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * Retrieves the properties for the specified repository.
 * @param {string} owner The owner of the repository.
 * @param {string} repo The name of the repository.
 * @param {string} token The GitHub token to use for authentication.
 * @returns {Promise<Array<{name: string, value: string}>>} A promise that resolves to an array of properties.
 */
export async function getRepoProperties(
  owner: string,
  repo: string,
  token: string
): Promise<{ property_name: string; value: string }[]> {
  const octokit = github.getOctokit(token)

  core.debug(`calling properties for ${owner}/${repo}`)

  const response = await octokit.request(
    `GET /repos/${owner}/${repo}/properties/values`,
    {}
  )

  return response.data
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug('starting action')

    const setEnv = core.getBooleanInput('set-env')
    const owner = core.getInput('owner', { required: true })
    const repo = core.getInput('repo', { required: true })
    const token = core.getInput('token', { required: true })
    const propertiesInput = core.getInput('properties')
    const propertiesFilter = propertiesInput
      .split(',')
      .map(property => property.trim().toLowerCase())
      .filter(property => property.length > 0)

    const response = await getRepoProperties(owner, repo, token)

    core.debug(`found ${response.length} properties`)

    // if response is an empty object
    if (response.length === 0) {
      core.info('No properties found')
      return
    }

    let numberSetProperties = 0
    for (const property of response) {
      if (
        propertiesFilter.length > 0 &&
        !propertiesFilter.includes(property.property_name.toLowerCase())
      ) {
        core.debug(`skipping ${property.property_name}`)
        continue
      }
      if (setEnv) {
        core.exportVariable(property.property_name, property.value)
      } else {
        core.setOutput(property.property_name, property.value)
      }
      numberSetProperties++
    }

    core.setOutput('number-set-properties', numberSetProperties)
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('An unknown error occurred')
    }
  }
}
