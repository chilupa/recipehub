import React from "react";

import { AppButton } from "../../design-system";

import "./IntroPagerFooter.css";

type Props = {
  isLastSlide: boolean;
  onPrimaryClick: () => void;
  onSkipClick: () => void;
};

const IntroPagerFooter: React.FC<Props> = ({
  isLastSlide,
  onPrimaryClick,
  onSkipClick,
}) => (
  <div className="intro-pager-footer">
    <AppButton
      type="button"
      fullWidth
      className="intro-pager-footer__primary"
      onClick={() => {
        onPrimaryClick();
      }}
    >
      {isLastSlide ? "Get started" : "Next"}
    </AppButton>
    <button
      type="button"
      className="intro-pager-footer__skip"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSkipClick();
      }}
    >
      Skip intro
    </button>
  </div>
);

export default IntroPagerFooter;
