// noinspection WebpackConfigHighlighting

const path = require("path");
//const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = {
    devtool: false,
    devServer: {
        port: 3000,
        static: [
            {
                directory:path.resolve(__dirname, "dist")
            },
            {
                directory: path.resolve(__dirname)
            }
        ],
        server: 'https',
        open: {
            target: 'widget.html'
        }
    },
    entry: {
        widget: "./src/widget.tsx",
        configuration: "./src/configuration.tsx",
        "build-details": "./src/build-details.tsx",
    },
    output: {
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {
            "azure-devops-extension-sdk": path.resolve("node_modules/azure-devops-extension-sdk")
        },
    },
    stats: {
        warnings: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.woff$/,
                use: [{
                    loader: 'base64-inline-loader'
                }]
            },
            {
                test: /\.html$/,
                loader: "file-loader"
            },
            {
                test: /\.woff2?$/i,
                type: 'asset/resource',
                dependency: { not: ['url'] },
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "**/*.html", context: "src" },
                { from: "**/*.css", context: "src" },
                { from: "**/*.scss", context: "src" }
            ]
        })
    ]
};
