import * as vscode from 'vscode';

import childProcess = require('child_process');
import { promisify } from 'util';

const execFile = promisify(childProcess.execFile);
const l = (message: string) => console.log(`[copy-permanent-url] ${message}`);

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('copy-permanent-url.copyPermanentUrl', async () => {
		const fileFullPath = vscode.window.activeTextEditor!.document.fileName;
		const selection = vscode.window.activeTextEditor!.selection;
		const startLineNumber = selection.start.line + 1;
		const endLineNumber = selection.end.line + 1;
		const args = [fileFullPath, startLineNumber.toString(), endLineNumber.toString()];

		l(`running dpu: args=${JSON.stringify(args)}`);
		const {
			stderr,
			stdout,
		} = await execFile('dpu', args);
		l(`ran dpu: args=${JSON.stringify(args)}`);

		if (stderr !== '') {
			l('error occurred:');
			l(stderr);
			vscode.window.showInformationMessage(`error occurred: ${stderr}`);
			return;
		}

		const permanentUrl = stdout.trimEnd();
		l(`determined: permanentUrl=${permanentUrl}`);
		vscode.env.clipboard.writeText(permanentUrl);
		vscode.window.showInformationMessage(`Copied: ${permanentUrl}`);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
