import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

    // Register the command
    let disposable = vscode.commands.registerCommand('extension.createReactComponent', async () => {
        // Check if the workspace is a React/React Native project
        const projectType = getProjectType();
        if (!projectType) {
            vscode.window.showErrorMessage('This extension can only be used in a React or React Native project.');
            return; // Prevent further execution if not a valid project
        }

        // Check for the existence of 'frontend' folder
        const hasFrontend = hasFrontendFolder();
        const hasExpoAppFolder = checkExpoAppFolder();

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No folder or workspace opened.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath; // Current workspace directory

        // Read the default extension from the configuration
        const config = vscode.workspace.getConfiguration();
        const defaultExtension = config.get<string>('reactComponentCreator.defaultExtension') || '.tsx';

        // Ask the user for the folder path and component name
        const componentPath = await vscode.window.showInputBox({
            prompt: 'Enter the folder path and component name (e.g., pages/HomeScreen)',
            value: 'MyComponent' // Default component name
        });

        if (!componentPath) {
            vscode.window.showErrorMessage('Path and component name cannot be empty.');
            return;
        }

        // Split the input into folder path and component name
        const pathSegments = componentPath.split('/');
        let componentName = pathSegments.pop() || ''; // Get the last segment as the component name
        let folderPath: string;

        // Determine the folder path based on the project type
        if (hasExpoAppFolder) {
            // If it's an Expo project, use the app folder directly
            folderPath = hasFrontend ? path.join(rootPath, 'frontend', 'app') : path.join(rootPath, 'app');
        } else if (hasFrontend) {
            // If frontend exists, use its src directory unless a specific path is given
            folderPath = path.join(rootPath, 'frontend', 'src');
        } else {
            // If no frontend exists, default to the src directory
            folderPath = path.join(rootPath, 'src');
        }

        // If the user has provided a path, add it to the folder path
        if (pathSegments.length > 0) {
            folderPath = path.join(folderPath, ...pathSegments);
        }

        // Ensure a valid component name is provided
        if (!componentName) {
            vscode.window.showErrorMessage('Component name cannot be empty.');
            return;
        }

        // Full path for the new file
        const fileName = `${componentName}${defaultExtension}`; // Append default extension
        const filePath = path.join(folderPath, fileName);

        // Check if the directory exists; if not, create it
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Check if the file already exists
        if (fs.existsSync(filePath)) {
            vscode.window.showErrorMessage(`File ${fileName} already exists.`);
            return;
        }

        // Get the appropriate boilerplate code based on the project type
        const componentCode = projectType === 'react-native' ? getReactNativeBoilerplate(componentName) : getReactBoilerplate(componentName);

        // Write the file to the specified directory
        fs.writeFile(filePath, componentCode, (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Error creating file: ${err.message}`);
                return;
            }

            // Show a success message
            vscode.window.showInformationMessage(`File ${fileName} created successfully in ${folderPath}!`);

            // Open the newly created file in the editor
            vscode.workspace.openTextDocument(filePath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

// Function to check if 'frontend' folder exists in the workspace
function hasFrontendFolder(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    const rootPath = workspaceFolders[0].uri.fsPath; // Current workspace directory
    const frontendPath = path.join(rootPath, 'frontend');

    // Check if the 'frontend' folder exists
    return fs.existsSync(frontendPath) && fs.lstatSync(frontendPath).isDirectory();
}

// Function to check if the workspace is an Expo project by looking for app/ or frontend/app/
function checkExpoAppFolder(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    const rootPath = workspaceFolders[0].uri.fsPath; // Current workspace directory
    const appPath = path.join(rootPath, 'app');
    const frontendAppPath = path.join(rootPath, 'frontend', 'app');

    // Check if the 'app' folder exists in root or in 'frontend'
    return fs.existsSync(appPath) || fs.existsSync(frontendAppPath);
}

// Function to check if 'package.json' exists in the frontend folder
function hasPackageJsonInFrontend(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    const frontendPath = path.join(workspaceFolders[0].uri.fsPath, 'frontend', 'package.json');

    return fs.existsSync(frontendPath);
}

// Function to check if 'package.json' exists in the root folder
function hasPackageJsonInRoot(): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    const rootPath = workspaceFolders[0].uri.fsPath; // Current workspace directory
    const packageJsonPath = path.join(rootPath, 'package.json');

    return fs.existsSync(packageJsonPath);
}

// Function to check the project type (React or React Native)
function getProjectType(): 'react' | 'react-native' | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        return null;
    }

    // Check for package.json in the frontend folder first
    const frontendPath = path.join(workspaceFolders[0].uri.fsPath, 'frontend', 'package.json');
    if (fs.existsSync(frontendPath)) {
        return checkProjectType(frontendPath);
    }

    // If no package.json in frontend, check in the root
    const rootPath = workspaceFolders[0].uri.fsPath;
    const packageJsonPath = path.join(rootPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        return checkProjectType(packageJsonPath);
    }

    return null; // Not a React or React Native project
}

// Helper function to check project type from package.json
function checkProjectType(packageJsonPath: string): 'react' | 'react-native' | null {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Check for dependencies related to React or React Native
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Check for Expo in dependencies
    if ('expo' in dependencies || 'expo' in devDependencies) {
        return 'react-native'; // It's an Expo project
    }

    if ('react-native' in dependencies || 'react-native' in devDependencies) {
        return 'react-native';
    }

    if ('react' in dependencies || 'react-dom' in dependencies || 'react' in devDependencies || 'react-dom' in devDependencies) {
        return 'react';
    }

    return null; // Not a React or React Native project
}

// Boilerplate code for a React Component
function getReactBoilerplate(componentName: string): string {
    return `
import React from 'react';

const ${componentName} = () => {
    return (
        <div>
            <h1>${componentName}</h1>
        </div>
    );
};

export default ${componentName};
    `;
}

// Boilerplate code for a React Native Component
function getReactNativeBoilerplate(componentName: string): string {
    return `
import { Text, View, StyleSheet } from 'react-native';

const ${componentName} = () => {
    return (
        <View style={styles.container}>
            <Text>${componentName}</Text>
        </View>
    );
};

export default ${componentName};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Further Styles here
    },
});
    `;
}
