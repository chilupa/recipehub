import { IonText } from "@ionic/react";
import { emptyStateFallback } from "../../lib/emptyStateMessages";
import "./NoData.css";

interface NoDataProps {
  title?: string;
  description?: string;
}

const NoData = ({
  title: customTitle,
  description: customDescription,
}: NoDataProps) => {
  return (
    <div className="no-data-block">
      <IonText>
        <h4>{customTitle ?? emptyStateFallback.title}</h4>
        <p className="no-data-block__description">
          {customDescription ?? emptyStateFallback.description}
        </p>
      </IonText>
    </div>
  );
};

export default NoData;
