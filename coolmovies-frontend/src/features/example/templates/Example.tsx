/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
// @ts-nocheck
import {
  Button,
  Paper,
  TextField,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../state";
import { exampleActions } from "../state";
import { memo } from "react";
import {
  useCurrentUserQuery,
  useLazyCurrentUserQuery,
} from "../../../generated/graphql";
import { FetchButton } from "../components/FetchButton";

const primary = "#1976d2";

const Example = () => {
  const dispatch = useAppDispatch();
  const exampleState = useAppSelector((state) => state.example);

  const [fetchUser, { data, isLoading: loading }] = useLazyCurrentUserQuery();
  return (
    <div css={styles.root}>
      <Paper elevation={3} css={styles.navBar}>
        <Typography>{"EcoPortal"}</Typography>
      </Paper>

      <div css={styles.body}>
        <Typography variant={"h1"} css={styles.heading}>
          {"EcoPortal Coolmovies Test"}
        </Typography>
        <Typography variant={"subtitle1"} css={styles.subtitle}>
          {`Thank you for taking the time to take our test. We really appreciate it. 
        All the information on what is required can be found in the README at the root of this repo.`}
        </Typography>
        <Typography variant={"subtitle1"} css={styles.subtitle}>
          {`I would recommend using Redux for a lot of your global state management. 
          For data fetching, you can use either Redux Observable or Apollo Hooks. Which you can see examples of below.`}
        </Typography>

        <Typography variant={"h4"} css={styles.subHeading}>
          {"State:"}
        </Typography>

        <Tooltip
          title={`Side Effect Count from Epic (Gets run on odd values): ${exampleState.sideEffectCount}`}
          arrow
        >
          <Button
            variant={"contained"}
            onClick={() => dispatch(exampleActions.increment())}
          >
            {`Redux Increment: ${exampleState.value}`}
          </Button>
        </Tooltip>

        <Typography variant={"h4"} css={styles.subHeading}>
          {"Data Fetching:"}
        </Typography>

        <div css={styles.mainControls}>
          <FetchButton
            onClick={() => dispatch(exampleActions.fetch())}
            label={"Fetch User using Redux Observable"}
          />
          <Zoom in={Boolean(exampleState.fetchData)} unmountOnExit mountOnEnter>
            <TextField
              css={styles.dataInput}
              multiline
              label={"User Data from GraphQL using Redux Observable"}
              defaultValue={JSON.stringify(exampleState.fetchData)}
            />
          </Zoom>

          <FetchButton
            onClick={() => fetchUser()}
            label={"Fetch User using Apollo Hooks"}
            disabled={loading}
          />
          <Zoom in={Boolean(data)} unmountOnExit mountOnEnter>
            <TextField
              css={styles.dataInput}
              multiline
              label={"User Data from GraphQL using Apollo Hooks"}
              defaultValue={JSON.stringify(data)}
            />
          </Zoom>
        </div>
      </div>
    </div>
  );
};

const styles = {
  root: css({
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),
  navBar: css({
    background: primary,
    height: 50,
    alignSelf: "stretch",
    display: "flex",
    alignItems: "center",
    padding: 16,
    borderRadius: 0,
    p: {
      color: "white",
    },
  }),
  body: css({
    alignSelf: "stretch",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }),
  heading: css({ marginTop: 16, fontSize: "2.75rem", textAlign: "center" }),
  subHeading: css({
    margin: "16px 0",
    fontSize: "1.25rem",
    textAlign: "center",
  }),
  subtitle: css({
    fontWeight: 300,
    textAlign: "center",
    maxWidth: 600,
    margin: "24px 0",
    color: "rgba(0, 0, 0, 0.6)",
  }),
  mainControls: css({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  }),
  dataInput: css({
    alignSelf: "stretch",
    margin: "32px 0",
  }),
};

export default memo(Example);
