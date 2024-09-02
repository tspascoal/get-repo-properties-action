# Get Repository Properties Action

![CI](https://github.com/tspascoal/get-repo-properties-action/actions/workflows/ci.yml/badge.svg)

This GitHub Action retrieves the [properties](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization) for a specified repository and sets them as environment variables or output variables.

> [!IMPORTANT]
> This action can only be used in repo owned by an organization.

> [!NOTE]  
> Repository custom properties are also available in the action events, for example in a push trigger the custom properties are available in GitHub context event.
> For example you can dump the content of custom properties with this expression `${{ toJson (github.event.repository.custom_properties)}}` or access the content directly
> For example if the property is called `testproperty` you can access it using `${{ github.event.repository.custom_properties.testproperty }}`

## Usage

### Setting Output Variables

This example retrieves the `property1` and `property2` properties for `mona/my-repo`, sets them as environment variables.

```yaml
- uses: tspascoal/get-repo-properties-action@v1
  with:
    set-env: true
    owner: mona
    repo: my-repo
    token: ${{ secrets.token }}
    properties: property1, property2

- run: |
    echo "PROPERTY1=$PROPERTY1"
    echo "PROPERTY2=$PROPERTY2"
```

### Setting Environment Variables

This example retrieves all properties for running repository, sets them as environment variables.

```yaml
- uses: tspascoal/get-repo-properties-action@v1
  id: get-properties
  with:
    set-env: true

- run: |
    echo "PROPERTY1=${{ steps.get-properties.outputs.property1 }}"
    echo "PROPERTY2=${{ steps.get-properties.outputs.property2 }}"
```

### Inputs

- `set-env` Whether to set the inputs as environment variables or output variables. Default is false.
- `owner` (Optional) The owner of the repository. Default is the owner of the repository where the action is running.
- `repo` (optional) The name of the repository. Default is the repository where the action is running.
- `token` (Required) The GitHub token to use for authentication. Uses GITHUB_TOKEN by default
- `properties` (optional) A comma-separated list of property names (case insensitive) to retrieve. If skipped all properties will be retrieve.

### Outputs

Sets an output `number-set-properties` with the number of properties that were set.

If `set-env` is false, then it will set as many outputs as properties were retrieved, with the name of the output being the name of the property (or filtered to the list of properties specified in the `properties` input). The casing of the property is preserved.

If `set-env` is true, then it will set as many environment variables as properties were retrieved, with the name of the environment variable being the name of the property (or filtered to the list of properties specified in the `properties` input). The casing of the environment variable is uppercased since it's default behavior of GitHub Actions.

## License

This project is [licensed](./LICENSE.md) under the MIT License.
