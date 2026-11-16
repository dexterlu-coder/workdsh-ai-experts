import * as React from 'react';

/** Presentation-only adapter for the pinned Harness layout. Never changes hit areas. */
export function ShellAppearance() {
  return <style>{`
    [class$="_sidebarCol"] { border-right-color: transparent; }
    [data-platform="darwin"] [class$="_centerCol"] { border-left-color: transparent; }
    [data-side="sidebar"]:hover { background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent); }
    [data-side="sidebar"][data-dragging] { background: color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent); }
    [class~="pXSMma_root"] [class~="pXSMma_previewBadge"] {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      user-select: none;
    }
    [class~="pXSMma_root"] [class~="pXSMma_titleGroup"] > span:first-child {
      font-size: 0;
    }
    [class~="pXSMma_root"] [class~="pXSMma_titleGroup"] > span:first-child::after {
      content: "AI专家办事大厅";
      color: var(--dsw-alias-label-primary);
      font-family: inherit;
      font-size: 26px;
      font-weight: 500;
      line-height: 32px;
      white-space: nowrap;
    }
  `}</style>;
}
