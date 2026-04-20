declare namespace JSX {
  type Element = { type: string; props: Record<string, unknown> };

  interface ElementChildrenAttribute {
    children: unknown;
  }

  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
