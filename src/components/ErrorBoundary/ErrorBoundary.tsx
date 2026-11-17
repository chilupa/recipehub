import React from "react";
import { IonContent, IonPage } from "@ionic/react";

import { AppButton, TextHeading } from "../../design-system";

import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("App render error:", error, errorInfo);
    }
  }

  private reloadApp = () => {
    window.location.reload();
  };

  private goHome = () => {
    window.location.assign("/recipes");
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <IonPage>
        <IonContent fullscreen className="ion-padding">
          <div className="error-boundary">
            <p className="error-boundary__eyebrow text-caption">
              Something went sideways
            </p>
            <TextHeading level={1} className="page-hero-title">
              RecipeHub hit a snag.
            </TextHeading>
            <p className="error-boundary__message text-body2">
              Your recipes are still safe. Try reloading the app, or head back
              to the recipe feed.
            </p>

            <div className="error-boundary__actions">
              <AppButton onClick={this.reloadApp}>Reload app</AppButton>
              <AppButton variant="text" onClick={this.goHome}>
                Go to feed
              </AppButton>
            </div>

            {import.meta.env.DEV && this.state.error ? (
              <pre className="error-boundary__details">
                {this.state.error.message}
              </pre>
            ) : null}
          </div>
        </IonContent>
      </IonPage>
    );
  }
}

export default ErrorBoundary;
