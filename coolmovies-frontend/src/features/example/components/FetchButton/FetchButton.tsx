import React, { FC, memo } from "react";
import { Button } from "@/components/ui/button";

type FetchButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label: string;
};

/**
 * Button that fetches data
 */
const FetchButton: FC<FetchButtonProps> = ({ label, onClick, disabled }) => {
  return (
    <Button variant={"outline"} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
};

export default memo(FetchButton);
