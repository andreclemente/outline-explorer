import * as vscode from 'vscode';

export function GetUnsupportedExtensions(): Set<string> {
    const config = vscode.workspace.getConfiguration('outline-explorer');
    const userExtensions = config.get<string[]>('unsupportedFileExtensions', []);

    const normalizedExtensions = new Set<string>();
    userExtensions.forEach(ext => {
        const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
        normalizedExtensions.add(normalizedExt);
    });

    return normalizedExtensions;
}

// New setting: singleClickOpen
export function GetSingleClickOpen(): boolean {
    const config = vscode.workspace.getConfiguration('outline-explorer');
    return config.get<boolean>('singleClickOpen', false);
}

let configChangeEventMap = new Map<string, OutlineExplorerConfigChangeEvent>();

export class OutlineExplorerConfigChangeEvent {
    section: string = '';
}

export class UnsupportedFileExtChangeEvent extends OutlineExplorerConfigChangeEvent {
    section: string = 'outline-explorer.unsupportedFileExtensions';
}

let unsupportedFileExtConfigChangeEventEmitter = new vscode.EventEmitter<UnsupportedFileExtChangeEvent>();
export let UnsupportedFileExtConfigChangedEvent = unsupportedFileExtConfigChangeEventEmitter.event;

// Optional: single click change event
let singleClickOpenChangeEventEmitter = new vscode.EventEmitter<void>();
export let SingleClickOpenChangedEvent = singleClickOpenChangeEventEmitter.event;

/**
 * 监听配置变更，当 unsupportedFileExtensions 或 singleClickOpen 改变时
 * @param context 扩展上下文
 */
export function Init(context: vscode.ExtensionContext): void {
    const configWatcher = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('outline-explorer.unsupportedFileExtensions')) {
            unsupportedFileExtConfigChangeEventEmitter.fire(new UnsupportedFileExtChangeEvent());
        }

        if (event.affectsConfiguration('outline-explorer.singleClickOpen')) {
            singleClickOpenChangeEventEmitter.fire();
        }
    });

    context.subscriptions.push(configWatcher);
}
