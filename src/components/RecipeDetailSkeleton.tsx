import React from "react";
import {
  IonItem,
  IonList,
  IonSkeletonText,
} from "@ionic/react";
import "../pages/RecipeDetail.css";

const RecipeDetailSkeleton: React.FC = () => (
  <div aria-busy="true" aria-label="Loading recipe">
    <div className="recipe-detail-top">
      <div className="recipe-detail-header-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <IonSkeletonText
            animated
            style={{
              width: "100%",
              height: 22,
              marginBottom: 8,
              borderRadius: 4,
            }}
          />
          <IonSkeletonText
            animated
            style={{ width: "72%", height: 22, borderRadius: 4 }}
          />
        </div>
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <IonSkeletonText
            animated
            style={{ width: 40, height: 40, borderRadius: 10 }}
          />
          <IonSkeletonText
            animated
            style={{ width: 40, height: 40, borderRadius: 10 }}
          />
        </div>
      </div>

      <IonSkeletonText
        animated
        style={{ width: "100%", height: 14, marginBottom: 8, borderRadius: 4 }}
      />
      <IonSkeletonText
        animated
        style={{ width: "88%", height: 14, marginBottom: 12, borderRadius: 4 }}
      />

      <IonSkeletonText
        animated
        style={{ width: 200, height: 12, marginBottom: 10, borderRadius: 4 }}
      />

      <div
        className="recipe-detail-chips-scroll"
        style={{ marginBottom: 10 }}
      >
        <IonSkeletonText
          animated
          style={{
            width: 88,
            height: 32,
            borderRadius: 16,
            flexShrink: 0,
          }}
        />
        <IonSkeletonText
          animated
          style={{
            width: 112,
            height: 32,
            borderRadius: 16,
            flexShrink: 0,
          }}
        />
        <IonSkeletonText
          animated
          style={{
            width: 72,
            height: 32,
            borderRadius: 16,
            flexShrink: 0,
          }}
        />
        <IonSkeletonText
          animated
          style={{
            width: 96,
            height: 32,
            borderRadius: 16,
            flexShrink: 0,
          }}
        />
        <IonSkeletonText
          animated
          style={{
            width: 64,
            height: 32,
            borderRadius: 16,
            flexShrink: 0,
          }}
        />
      </div>

      <div className="recipe-detail-author-row">
        <div className="recipe-detail-author-block">
          <IonSkeletonText
            animated
            style={{ width: 20, height: 20, borderRadius: "50%" }}
          />
          <IonSkeletonText
            animated
            style={{ width: 140, height: 14, borderRadius: 4 }}
          />
        </div>
        <IonSkeletonText
          animated
          style={{ width: 56, height: 36, borderRadius: 8 }}
        />
      </div>
    </div>

    <section className="recipe-detail-section">
      <IonSkeletonText
        animated
        style={{ width: 140, height: 20, marginBottom: 12, borderRadius: 4 }}
      />
      <IonList lines="full">
        {[1, 2, 3, 4, 5].map((i) => (
          <IonItem key={i}>
            <IonSkeletonText
              animated
              style={{
                width: `${Math.max(56, 96 - i * 6)}%`,
                height: 15,
                borderRadius: 4,
              }}
            />
          </IonItem>
        ))}
      </IonList>
    </section>

    <section className="recipe-detail-section">
      <IonSkeletonText
        animated
        style={{ width: 160, height: 20, marginBottom: 12, borderRadius: 4 }}
      />
      <IonList lines="full">
        {[1, 2, 3].map((i) => (
          <IonItem key={i}>
            <div
              className="recipe-detail-instruction-row"
              style={{ width: "100%" }}
            >
              <IonSkeletonText
                animated
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <IonSkeletonText
                animated
                style={{
                  flex: 1,
                  height: 15,
                  borderRadius: 4,
                }}
              />
            </div>
          </IonItem>
        ))}
      </IonList>
    </section>
  </div>
);

export default RecipeDetailSkeleton;
