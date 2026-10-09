"use client";

/** Error boundary that hides the 3D scene if its lazy module or renderer throws. */
import { Component, type ReactNode } from "react";

export type SceneBoundaryProps = { children: ReactNode };
type SceneBoundaryState = { failed: boolean };

export default class SceneBoundary extends Component<
  SceneBoundaryProps,
  SceneBoundaryState
> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
