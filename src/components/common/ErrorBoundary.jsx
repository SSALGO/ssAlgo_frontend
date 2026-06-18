import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error(`[ErrorBoundary:${this.props.name}]`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', color: '#b00020', whiteSpace: 'pre-wrap' }}>
          <strong>{this.props.name || 'App'} crashed:</strong>
          {'\n'}
          {this.state.error?.toString()}
          {'\n\n'}
          {this.state.info?.componentStack}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
