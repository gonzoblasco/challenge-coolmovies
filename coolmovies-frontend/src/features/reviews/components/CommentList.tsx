import React, { FC } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  title?: string | null;
  body?: string | null;
  userByUserId?: {
    id: string;
    name: string;
  } | null;
}

interface CommentListProps {
  comments: (Comment | null)[];
}

export const CommentList: FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
      <h5 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-3 h-3" />
        Comments
      </h5>
      {comments.map((comment) => {
        if (!comment) return null;
        return (
          <div
            key={comment.id}
            className="bg-background/50 rounded-md p-3 text-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-xs">
                {comment.userByUserId?.name || "Anonymous"}
              </span>
            </div>
            {comment.title && (
              <div className="font-medium text-xs mb-1">{comment.title}</div>
            )}
            <div className="text-foreground/80">{comment.body}</div>
          </div>
        );
      })}
    </div>
  );
};
