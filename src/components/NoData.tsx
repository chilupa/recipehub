import { IonText } from "@ionic/react";

interface NoDataProps {
  title?: string;
  description?: string;
}

const title = "No Data Available";
const description = "There is no data to display at the moment.";

const NoData = ({
  title: customTitle,
  description: customDescription,
}: NoDataProps) => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <IonText>
        <h4 style={{ color: "var(--ion-color-dark)" }}>
          {customTitle || title}
        </h4>
        <p style={{ color: "var(--ion-color-medium)" }}>
          {customDescription || description}
        </p>
      </IonText>
    </div>
  );
};

export default NoData;
