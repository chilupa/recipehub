import { AppEmptyState } from "../../design-system";
import { emptyStateFallback } from "../../lib/emptyStateMessages";

interface NoDataProps {
  title?: string;
  description?: string;
}

const NoData = ({
  title: customTitle,
  description: customDescription,
}: NoDataProps) => (
  <AppEmptyState
    title={customTitle ?? emptyStateFallback.title}
    description={customDescription ?? emptyStateFallback.description}
  />
);

export default NoData;
