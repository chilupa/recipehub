import React from "react";
import { IonButton, IonContent, IonPage, IonText } from "@ionic/react";

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
            <IonText>
              <p className="error-boundary__eyebrow">Something went sideways</p>
              <h1>RecipeHub hit a snag.</h1>
              <p className="error-boundary__message">
                Your recipes are still safe. Try reloading the app, or head back
                to the recipe feed.
              </p>
            </IonText>

            <div className="error-boundary__actions">
              <IonButton onClick={this.reloadApp}>Reload app</IonButton>
              <IonButton fill="clear" onClick={this.goHome}>
                Go to feed
              </IonButton>
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
