import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "../../../state";
import { exampleActions } from "../state";
import { memo, useState } from "react";
import {
  useCurrentUserQuery,
  useLazyCurrentUserQuery,
} from "../../../generated/graphql";
import { FetchButton } from "../components/FetchButton";
import { cn } from "@/lib/utils";

const Example = () => {
  const dispatch = useAppDispatch();
  const exampleState = useAppSelector((state) => state.example);

  // RTK Query hook
  const [fetchUser, { data, isLoading: loading }] = useLazyCurrentUserQuery();

  // For the moment, we keep the Redux dispatch for 'fetch' but we might need to remove the epic later.
  // The 'fetch' action was triggering an epic. We will deal with logic migration in next text.

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-background text-foreground">
      <div className="w-full bg-primary h-[50px] flex items-center px-4 shadow-sm">
        <p className="text-primary-foreground font-medium">EcoPortal</p>
      </div>

      <div className="w-full p-8 flex flex-col items-center max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            EcoPortal Coolmovies Test
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            Thank you for taking the time to take our test. We really appreciate
            it. All the information on what is required can be found in the
            README at the root of this repo.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light">
            I would recommend using Redux for a lot of your global state
            management. For data fetching, you can use either Redux Observable
            or Apollo Hooks. Which you can see examples of below.
          </p>
        </div>

        <h4 className="text-xl font-semibold mt-4">State:</h4>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                onClick={() => dispatch(exampleActions.increment())}
              >
                Redux Increment: {exampleState.value}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Side Effect Count (Legacy): {exampleState.sideEffectCount}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <h4 className="text-xl font-semibold mt-4">Data Fetching:</h4>

        <div className="flex flex-col gap-4 w-full max-w-md">


          <FetchButton
            onClick={() => fetchUser()}
            label={"Fetch User using RTK Query"}
            disabled={loading}
          />
          {data && (
            <div className="animate-in fade-in zoom-in duration-300">
              <label className="text-sm font-medium mb-1 block">User Data from GraphQL using RTK Query</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                readOnly
                value={JSON.stringify(data, null, 2)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Example);
