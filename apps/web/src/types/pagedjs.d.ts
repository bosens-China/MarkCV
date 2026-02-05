declare module 'pagedjs' {
  export interface Polisher {
    setup(): Promise<void>;
  }

  export interface Chunker {
    setup(): Promise<void>;
  }

  export interface PreviewerOptions {
    auto?: boolean;
  }

  export class Previewer {
    constructor(options?: PreviewerOptions);
    preview(
      content: string | HTMLElement,
      stylesheets: string[],
      renderTo: HTMLElement,
    ): Promise<any>;
    registerHandlers(handlers: any[]): void;
    remove(): void; // Assuming remove exists or we handle cleanup manually
  }

  export interface Handler {
    new (chunker: Chunker, polisher: Polisher, caller: any): any;
  }

  export function registerHandlers(handlers: Handler[]): void;
}
