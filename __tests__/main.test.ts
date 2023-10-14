import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from '../src/main'

// Mock the core module
jest.mock('@actions/core')

// Mock the github module
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn().mockReturnValue({
    request: jest.fn().mockResolvedValue({
      data: [
        { property_name: 'property1', value: 'value1' },
        { property_name: 'property2', value: 'value2' },
        { property_name: 'property3', value: 'value3' }
      ]
    })
  })
}))

function createInputMock(inputs: Record<string, string>): jest.Mock {
  return jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    if (name in inputs) {
      return inputs[name]
    } else {
      return ''
    }
  }) as jest.Mock
}

describe('run', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = {}
  })

  it('sets environment variables when setEnv is true', async () => {
    // Arrange
    const setBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockReturnValue(true)
    const exportVariableMock = jest.spyOn(core, 'exportVariable')

    const getInputMock = createInputMock({
      owner: 'mona',
      repo: 'my-repo',
      token: 'ghp_token'
    })

    await run()

    expect(setBooleanInputMock).toHaveBeenCalledWith('set-env')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('token', { required: true })
    expect(github.getOctokit).toHaveBeenCalledWith('ghp_token')
    expect(github.getOctokit).toHaveBeenCalledTimes(1)
    expect(github.getOctokit('token').request).toHaveBeenCalledWith(
      'GET /repos/mona/my-repo/properties/values',
      {}
    )
    expect(github.getOctokit('token').request).toHaveBeenCalledTimes(1)
    expect(exportVariableMock).toHaveBeenCalledWith('property1', 'value1')
    expect(exportVariableMock).toHaveBeenCalledWith('property2', 'value2')
    expect(exportVariableMock).toHaveBeenCalledWith('property3', 'value3')
    expect(core.setOutput).toHaveBeenCalledTimes(1)
    expect(core.setOutput).toHaveBeenCalledWith('number-set-properties', 3)
  })

  it('sets output variables when setEnv is false', async () => {
    const setBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockReturnValue(false)
    const setOutputMock = jest.spyOn(core, 'setOutput')
    const exportVariableMock = jest.spyOn(core, 'exportVariable')

    const getInputMock = createInputMock({
      owner: 'mona',
      repo: 'my-repo',
      token: 'ghp_token'
    })

    await run()

    expect(setBooleanInputMock).toHaveBeenCalledWith('set-env')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('token', { required: true })
    expect(github.getOctokit).toHaveBeenCalledWith('ghp_token')
    expect(github.getOctokit).toHaveBeenCalledTimes(1)
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledWith(
      'GET /repos/mona/my-repo/properties/values',
      {}
    )
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledTimes(1)
    expect(core.exportVariable).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('property1', 'value1')
    expect(setOutputMock).toHaveBeenCalledWith('property2', 'value2')
    expect(setOutputMock).toHaveBeenCalledWith('property3', 'value3')
    expect(core.setOutput).toHaveBeenCalledWith('number-set-properties', 3)
    expect(exportVariableMock).not.toHaveBeenCalled()
  })

  it('sets environment variables when setEnv is true and properties has values', async () => {
    // Arrange
    const setBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockReturnValue(true)
    const exportVariableMock = jest.spyOn(core, 'exportVariable')

    const getInputMock = createInputMock({
      owner: 'mona',
      repo: 'my-repo',
      token: 'ghp_token',
      properties: 'property1, property2'
    })

    await run()

    expect(setBooleanInputMock).toHaveBeenCalledWith('set-env')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('token', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('properties')
    expect(github.getOctokit).toHaveBeenCalledWith('ghp_token')
    expect(github.getOctokit).toHaveBeenCalledTimes(1)
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledWith(
      'GET /repos/mona/my-repo/properties/values',
      {}
    )
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledTimes(1)
    expect(exportVariableMock).toHaveBeenCalledWith('property1', 'value1')
    expect(exportVariableMock).toHaveBeenCalledWith('property2', 'value2')
    expect(exportVariableMock).not.toHaveBeenCalledWith('property3', 'value3')
    expect(core.setOutput).toHaveBeenCalledTimes(1)
    expect(core.setOutput).toHaveBeenCalledWith('number-set-properties', 2)
  })

  it('sets environment variables when setEnv is true and properties has values (case insentive)', async () => {
    // Arrange
    const setBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockReturnValue(true)
    const exportVariableMock = jest.spyOn(core, 'exportVariable')

    const getInputMock = createInputMock({
      owner: 'mona',
      repo: 'my-repo',
      token: 'ghp_token',
      properties: 'PROPERTY1, PROPERTY2'
    })

    await run()

    expect(setBooleanInputMock).toHaveBeenCalledWith('set-env')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('token', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('properties')
    expect(github.getOctokit).toHaveBeenCalledWith('ghp_token')
    expect(github.getOctokit).toHaveBeenCalledTimes(1)
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledWith(
      'GET /repos/mona/my-repo/properties/values',
      {}
    )
    expect(github.getOctokit('ghp_token').request).toHaveBeenCalledTimes(1)
    expect(exportVariableMock).toHaveBeenCalledWith('property1', 'value1')
    expect(exportVariableMock).toHaveBeenCalledWith('property2', 'value2')
    expect(exportVariableMock).not.toHaveBeenCalledWith('property3', 'value3')
    expect(core.setOutput).toHaveBeenCalledTimes(1)
    expect(core.setOutput).toHaveBeenCalledWith('number-set-properties', 2)
  })

  it('fails the workflow run if an error occurs', async () => {
    // Arrange
    const setBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockReturnValue(false)
    const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()

    const getInputMock = createInputMock({
      owner: 'mona',
      repo: 'my-repo',
      token: 'ghp_token'
    })

    jest.spyOn(github, 'getOctokit').mockImplementation(() => {
      throw new Error('Test error')
    })

    await run()

    expect(setBooleanInputMock).toHaveBeenCalledWith('set-env')
    expect(getInputMock).toHaveBeenCalledWith('owner', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('repo', { required: true })
    expect(getInputMock).toHaveBeenCalledWith('token', { required: true })
    expect(github.getOctokit).toHaveBeenCalledWith('ghp_token')
    expect(setFailedMock).toHaveBeenCalledWith('Test error')
  })
})
