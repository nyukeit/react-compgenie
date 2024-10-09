# React Component Genie

React Component Genie creates React or React Native components by simply specifying a file name. It auto-detects the type of project and inserts the correct boilerplate code. Currently supports React, React Native basic and React Native Expo.

## Features

1. Generate React/React-Native components by providing a file name.
2. Generate components in a specific directory by providing the full path.
3. Creates a '.tsx' component by default but this can be changed to '.jsx'.
4. Detects if the project is React or React Native (base or Expo) to create suitable component code.
5. Automatically detects the presence of 'frontend' folder, to create components inside this folder if it exists.

## How To Use

1. Bring up the command palette by pressing `ctrl + shift + p`. 
2. Search for 'Create React Component'. 
3. Start typing the name of your component that you wish to create.
    Eg. `MyComponent`
4. If you wish to create a component in a specific folder, type the entire path.
    Eg. `src/components/MyComponent`

## Extension Settings

To change the default extension of your components, open VS Code Settings and search for 'React Component Genie'.

You can choose between the extensions '.tsx' and '.jsx'.

* `reactComponentGenie.defaultExtension`: Set default file extension to 'tsx' or 'jsx'.

## Known Issues

First release.

## Release Notes

### 1.0.0
Initial Release