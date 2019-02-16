// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TocManager } from "docs-cog-services";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "docs-authoring-extras" is now active!');
	console.log("processs.versions = " + JSON.stringify(process.versions));
	console.log("__dirname = " + __dirname);


	let workSpaceConfiguration = vscode.workspace.getConfiguration('DocsAuthoringExtras');

	console.log(JSON.stringify(workSpaceConfiguration));


    if (!workSpaceConfiguration || !workSpaceConfiguration["text-analytics-key"] || !workSpaceConfiguration["text-analytics-host"] || !workSpaceConfiguration["text-analytics-route"]){
        console.log("VSCode extension docs-authoring-extras expected workspace settings but didn't find them.");
        return;
    }

    const config = {
        key: workSpaceConfiguration["text-analytics-key"],
        uri: workSpaceConfiguration["text-analytics-host"],
        route: workSpaceConfiguration["text-analytics-route"],
        filterout: workSpaceConfiguration["text-analytics-filter"],
        maxCount: workSpaceConfiguration["text-analytics-keyword-max-count"]
	}
	
	console.log(config);

	// Construct cog serv TOC with required text analytics information
	let tocMgr = new TocManager(config);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.docs-authoring-extras', () => {
		// The code you place here will be executed every time your command is executed

		// Get information from active window
		// TOC must be active window
		let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        let doc = activeEditor.document;
        let currentText = doc.getText();

		// construct
        let tocInfo = {
            absolutePath:  doc.fileName,
            text:  currentText,
            isDirty: doc.isDirty
        };

		console.log(JSON.stringify(tocInfo));

        tocMgr.getKeywordsAsync(tocInfo,undefined,undefined).then((newText) => {

            console.log("newtext");
            console.log(newText);

            activeEditor.edit(editBuilder => {

                // line 0, position 0, 
                // last line, last position
                let range = new vscode.Range(new vscode.Position(0,0),doc.lineAt(doc.lineCount-1).range.end);
                editBuilder.replace(range, newText);

                vscode.window.showInformationMessage("File contents have keywords now");

            });
        }).catch((err) => {
			console.log(err);
		});		

		// Display a message box to the user
		//vscode.window.showInformationMessage('docs authoring extras from code');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
