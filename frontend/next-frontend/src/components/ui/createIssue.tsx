"use client"

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Board, Category, issue, linkedIssues, status, User, Workspace } from "@/src/helpers/type";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Button from "./button";
import { BoardsInWorkspace, UsersInWorkspace } from "@/src/lib/api/workspace";
import { handleAxiosError } from "@/src/helpers/response-handler";
import { useState } from "react";
import { useAuth } from "@/src/Authentication/authcontext";
import { searchIssue } from "@/src/lib/api/issue";
import { ColorPickerPopover } from "./colorpicker";
import { debounce } from "lodash";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Icon, { IconType } from "@/src/helpers/icon";
import TextArea from "../shared/textArea";


interface CreateIssueProps {
  className?: string,
  definedUI?: React.ReactNode,
  workspace: Workspace[]
}

export function CreateIssueForm({ className, definedUI, workspace }: CreateIssueProps) {
  const [user, setUser] = useState<User[]>([])
  const [board, setBoard] = useState<Board[]>([])
  const [parent, setParent] = useState<issue[]>([])
  const [formData, setFormData] = useState<issue>({})
  const [searchResult, setSearchResult] = useState<issue[]>([])
  const { currentUser } = useAuth()

  const search = useMemo(() => debounce((workspace_id: string, title: string) => {
    searchIssue({ workspace_id, title })
      .then((response) => {
        setSearchResult(response);
      });
  }, 300), [formData.workspace_id]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    console.log(searchValue)
    if (searchValue.length > 2 && formData.workspace_id) {
      search(formData.workspace_id, searchValue);
    }
  };


  const fetchUser = async (workspaceId: string) => {
    try {
      const response = await UsersInWorkspace(workspaceId);
      const boardResponse = await BoardsInWorkspace(workspaceId)
      const fetchparent = await searchIssue({ workspace_id: workspaceId, issuetype: "epic" })
      setUser(response);
      setBoard(boardResponse);
      if (fetchparent) {
        setParent(fetchparent);
      }
      return response.data;
    }
    catch (error) {
      handleAxiosError(error);
      return null;
    }
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        {definedUI ? definedUI :
          <Button
            variant="empty"
            className="mt-4 w-full py-2 px-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-700 transition-colors">
            + Create Issue
          </Button>
        }
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          <Card className={cn("w-full shadow-none border-0", className)}>
            <CardHeader>
              <CardTitle className="text-lg">Create issue</CardTitle>
              <p className="text-xs text-muted-foreground mt-2">
                Required fields are marked with an asterisk *
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pb-2">
              {/* Project Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Project <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value: string) => {
                  fetchUser(value);
                  setFormData(prev => ({ ...prev, workspace_id: value }))

                }}>
                  <SelectTrigger className="w-[300px]">
                    {/* Display the first workspace title or a placeholder if none exists */}
                    <SelectValue placeholder={workspace[0].title || "Select a Workspace"} />
                  </SelectTrigger>
                  <SelectContent>
                    {workspace.map((item: Workspace) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Issue Type Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Issue type <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Select onValueChange={(value: string) => setFormData(prev => ({ ...prev, issueType: value }))}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Story" />
                    </SelectTrigger>
                    <SelectContent>
                      {Category.map((item: IconType) => (
                        <SelectItem key={item} value={item}>
                          <div className="flex items-center gap-2">
                            <Icon type={item} isIssueType={true} />  {/* Use the icon from the category */}
                            <span>{item}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="empty" className="text-sm text-muted-foreground h-auto p-0">
                  Learn about issue types
                </Button>
              </div>

              <hr className="w-full border-t border-gray-300 my-4" />
              {/* Status Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="To Do" />
                    </SelectTrigger>
                    <SelectContent>
                      {status.map((item: string) => (
                        <SelectItem key={item} value={item}>
                          <div className="flex items-center gap-2">
                            <span>{item}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the issue's initial status upon creation
                </p>
              </div>

              {/* Summary Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Summary <span className="text-red-500">*</span>
                </Label>
                <Input placeholder="Enter issue summary" />
              </div>

              {/* Description Field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Description</Label>
                </div>
                {Object.keys(user).length > 0 && <TextArea users={user} maxLength={1000} />}
              </div>
              {/* Assignees Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assignees</Label>
                <Select
                  onValueChange={(value: string) => {
                    setFormData(prev =>
                    ({
                      ...prev, assignee: (prev.assignee)?.includes(value) ?
                        prev.assignee : [...(prev.assignee ?? []), value]
                    }));
                    console.log('Form Data:', formData)
                  }}
                >
                  <SelectTrigger className="w-[200px] min-h-[40px]">
                    {formData.assignee && formData.assignee.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {formData.assignee.map((assigneeId, index) => {
                          const assignedUser = user.find(u => u.user_id === assigneeId);
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs px-2 py-1"
                            >
                              {assignedUser?.username ?? assigneeId}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(prev => ({
                                    ...prev,
                                    assignee: prev.assignee?.filter(id => id !== assigneeId)
                                  }));
                                }}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <SelectValue placeholder="Unassignedssss" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {user.map((item: User) => (
                      <SelectItem key={item.user_id} value={item.user_id}>
                        <div className="flex items-center gap-2">
                          <img src={item.image.imageFullUrl} alt={"User"} className="w-6 h-6 rounded-full" />
                          <span>{item.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Board Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Board</Label>
                <Select onValueChange={(value: string) => {
                  setFormData(prev => ({ ...prev, board_id: value }))
                  console.log('Form Data:', formData)
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {board.map((item: Board) => (
                      <SelectItem key={item._id} value={item._id}>
                        <div className="flex items-center gap-2">
                          <img src={item.image.imageFullUrl} alt={"Board"} className="w-6 h-6 rounded-full" />
                          <span>{item.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* parent Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parent</Label>
                <Select onValueChange={(value: string) => setFormData(prev => ({ ...prev, parentIssueId: value }))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {parent.map((item: issue) => (
                      <SelectItem key={item._id} value={item._id || "null"}>
                        <div className="flex items-center gap-2">
                          <Icon type={item.status || "task"} />
                          <span>{item.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Linked Field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Linked Issue</Label>
                <Select onValueChange={(value: string) => setFormData(prev => ({
                  ...prev,
                  linkedIssues: [{
                    ...prev.linkedIssues?.[0],
                    type: value,
                  }],
                }))}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkedIssues.map((item: string) => (
                      <SelectItem key={item} value={item}>
                        <div className="flex items-center gap-2">
                          <span>{item}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Issue Select */}
                <div className="relative w-[300px]">
                  <Input
                    type="text"
                    placeholder="Search issues by title..."
                    onChange={(e) => { handleSearch }} />
                  {searchResult.length > 0 && (
                    <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto">
                      {searchResult.map((item: issue) => (
                        <div key={item._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              linkedIssues: [{
                                ...prev.linkedIssues?.[0],
                                issueId: item._id,
                              }],
                            }));
                            setSearchResult([]); // Clear search results after selection
                          }}>
                          <div className="flex items-center gap-2">
                            <Icon type={item.issuetype || "task"} />
                            <span>{item.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Issue color</Label>
                <ColorPickerPopover color={formData.color || '#2ecc71'} onChange={(newColor: string) => setFormData(prev => ({ ...prev, color: newColor }))} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4 mt-auto">
          {/* Create Another Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox id="create-another" />
            <Label htmlFor="create-another" className="text-sm font-medium">
              Create another issue
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="empty">Cancel</Button>
            <Button variant="primary">Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

  );
}

