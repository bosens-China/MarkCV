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
    ): Promise<unknown>;
    registerHandlers(handlers: Handler[]): void;
    remove(): void;
  }

  export interface Handler {
    new (
      chunker: Chunker,
      polisher: Polisher,
      caller: unknown,
    ): unknown;
  }

  export function registerHandlers(handlers: Handler[]): void;
}
