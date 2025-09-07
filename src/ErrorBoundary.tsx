import React from "react";

type Props = { children: React.ReactNode };
type State = { error: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  componentDidCatch(error: any) {
    this.setState({ error });
    console.error("UI error:", error);
  }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message ?? String(this.state.error);
      return (
        <div style={{ margin: 16, padding: 12, border: "1px solid #fecaca", background: "#fff1f2", color: "#991b1b" }}>
          Uygulama hata verdi: {msg}
        </div>
      );
    }
    return this.props.children;
  }
}
