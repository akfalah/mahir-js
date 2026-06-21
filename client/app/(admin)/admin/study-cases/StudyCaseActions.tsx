"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { StudyCase } from "@/types";

import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Props =
  | { mode: "create"; materialId: number }
  | { mode: "edit"; studyCase: StudyCase; materialId: number };

export default function StudyCaseActions(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = props.mode === "edit";
  const studyCase = isEdit ? props.studyCase : null;

  const [title, setTitle] = useState(studyCase?.title ?? "");
  const [description, setDescription] = useState(studyCase?.description ?? "");
  const [starterCode, setStarterCode] = useState(studyCase?.starterCode ?? "");
  const [order, setOrder] = useState(studyCase?.order?.toString() ?? "");
  const [functionName, setFunctionName] = useState(studyCase?.functionName ?? "");
  const [parameterNames, setParameterNames] = useState(
    studyCase?.parameterNames?.join(", ") ?? ""
  );

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setError(null);
      if (!isEdit) {
        setTitle("");
        setDescription("");
        setStarterCode("");
        setOrder("");
        setFunctionName("");
        setParameterNames("");
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        title,
        description,
        starterCode,
        order: Number(order),
        functionName,
        parameterNames: parameterNames.split(",").map((p) => p.trim()).filter(Boolean),
        materialId: props.materialId,
      };

      if (isEdit) {
        await api.patch(`/study-cases/${studyCase!.id}`, payload);
      } else {
        await api.post("/study-cases", payload);
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response: { data: { errors: string } } };
        setError(axiosError.response.data.errors);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studyCase) return;
    if (!confirm(`Delete "${studyCase.title}"? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      await api.delete(`/study-cases/${studyCase.id}`);
      router.refresh();
    } catch {
      alert("Failed to delete study case.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isEdit ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Study Case
        </Button>
      )}

      <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none">
          <DrawerHeader className="border-b">
            <DrawerTitle>
              {isEdit ? "Edit Study Case" : "Create Study Case"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Check Adult"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this study case..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionName">Function Name</Label>
              <Input
                id="functionName"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="e.g. isAdult"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameterNames">
                Parameter Names
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (comma separated)
                </span>
              </Label>
              <Input
                id="parameterNames"
                value={parameterNames}
                onChange={(e) => setParameterNames(e.target.value)}
                placeholder="e.g. age, name"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="starterCode">Starter Code</Label>
              <Textarea
                id="starterCode"
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                placeholder="function isAdult(age) {&#10;  // your code here&#10;}"
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="e.g. 1"
                min={1}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DrawerFooter className="border-t">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </Button>
            
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}