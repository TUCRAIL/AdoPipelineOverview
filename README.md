# Azure DevOps pipeline overview

## How it works

This widget allows you to display the various builds executed on a specific pipeline for one branch.
![Image of the widget](img/widget.png)

You can also filter them by tags to further reduce the scope of the widget and track your release more precisely.

## Configuration

You can configure the following properties of your widget:
- Size: You can increase or reduce the size of your widget to adapt it to the amount of builds or stage you are displaying
- Build definition: You can choose which build definition inside your `Pipelines` blade to use for the widget
- Branch: You can choose a specific branch to monitor with your build
- Build count: You can specify how many builds you want to display
- Tag: Filter your builds to only display builds tagged with a specific keyword

![Image of the configuration panel](img/configuration.png)

## How you can help to improve this widget

As you can see, while this widget works for simple, linear builds. It is principally focused on release management
making use of a single branch per dashboard.

As such, here is a small list of improvements we would like to implement, and you could help us improve on

### Support for multiple branch filtering

Right now, this widget can only filter by a single branch. It would be better to be able to filter either:
- A multi-selection of many branches

### Support for multiple tag filtering
This is similar to the previous point. Except that a multi-selection dropdown should be implemented


### Support for multi-stage display

Sometimes, you can have multiple stage that depends on a single stage and run in parallel. This widget has no way of 
displaying this currently. This would likely be implemented through a third party graph library.

### Better UI

Regardless of the previous point. The UI is "Bare bone" and could be heavily improved.

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

