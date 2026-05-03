import React from "react";
import "./LoginHero.css";

const LoginHero: React.FC = () => (
  <header className="login-hero">
    <div className="login-brand-mark">
      <img
        src="/AppIcon.png"
        alt=""
        width={64}
        height={64}
        decoding="async"
      />
    </div>
    <h1 className="login-title">RecipeHub</h1>
    <p className="login-subtitle">
      Create, save, and edit your recipes, favorite others’ dishes, and keep
      everything in sync across your devices.
    </p>
  </header>
);

export default LoginHero;
