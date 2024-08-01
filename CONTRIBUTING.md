## How to run locally for development

This project is using webpack to bundle the code and debug it.

To get started with the project, run `npm install` in the same directory as the `package.json` file. Also run `npm i -g tfx-cli` to install the Azure DevOps CLI.

Copy paste the `vss-extension-devel.json` file inside the same directory with another name such as `vss-extension-debug.json` and do not track it with git. Inside that file, modify:

- The id of the extension
- It's name
- The publisher
- The following string `"your-publisher-id.vsts-extensions-myExtensions.DeploymentsWidget.Configuration"` to match your publisher id

Then, you can run `npm compile` to publish the artifacts and run `tfx extension create --manifests .\vss-extension-debug.json` to create a vsix file. 
Go to `https://marketplace.visualstudio.com/` and publish this vsix file to your publisher to create the development extension.

You will also need to share this extension with your organization before being able to install it in your ADO instance.

Afterward, you can run `debug-server` to start a local server that will serve the widget.

Add the widget to your dashboard and you should be able to see the widget in action. The widget will automatically reflect changes as you make them so you shouldn't need to publish the extension unless you make changes that specifically requires them.
Such as:

- Changing the scopes
- Adding a new addressable folder
- Changing the extension/contributions ids
- ...
