# Fluent token usage

Simple tool to compute Fluent React v9 token usage.

Provides a summary report with total token count and percentage used of available tokens along with a detailed report of all token usage.

This is not incredibly rigorous and is meant to get a good enough estimate of token usage.

## Usage

0. Clone this repo
1. `yarn` to install dependencies
2. Get the absolute path to the `@fluentui/react-components` folder on your computer. E.g. `/home/$user/fluentui/packages/react-components`
3. Run the tool with the path: `yarn find /home/$user/fluentui/packages/react-components`
4. CSVs will be written to disk in this folder.