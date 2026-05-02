import React from "react";
import { IonCard, IonSkeletonText } from "@ionic/react";
import "./RecipeCard.css";

const RecipeCardSkeleton: React.FC = () => (
  <IonCard className="recipe-card recipe-card-skeleton">
    <div className="recipe-card__body">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <IonSkeletonText
            animated
            style={{ width: "92%", height: 18, marginBottom: 8, borderRadius: 4 }}
          />
          <IonSkeletonText
            animated
            style={{ width: "55%", height: 18, marginBottom: 10, borderRadius: 4 }}
          />
          <IonSkeletonText
            animated
            style={{ width: "100%", height: 13, marginBottom: 6, borderRadius: 4 }}
          />
          <IonSkeletonText
            animated
            style={{ width: "78%", height: 13, borderRadius: 4 }}
          />
        </div>
        <IonSkeletonText
          animated
          style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 8,
        }}
      >
        <IonSkeletonText
          animated
          style={{ width: 72, height: 24, borderRadius: 12 }}
        />
        <IonSkeletonText
          animated
          style={{ width: 52, height: 24, borderRadius: 12 }}
        />
        <IonSkeletonText
          animated
          style={{ width: 64, height: 24, borderRadius: 12 }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IonSkeletonText
            animated
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
          <IonSkeletonText
            animated
            style={{ width: 128, height: 14, borderRadius: 4 }}
          />
        </div>
        <IonSkeletonText
          animated
          style={{ width: 52, height: 32, borderRadius: 8 }}
        />
      </div>
    </div>
  </IonCard>
);

export default RecipeCardSkeleton;
