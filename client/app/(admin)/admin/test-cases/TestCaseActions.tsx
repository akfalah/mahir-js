"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestCase } from "@/types";
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
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Props =
  | { mode: "create"; studyCaseId: number }
  | { mode: "edit"; testCase: TestCase; studyCaseId: number };

export default function TestCaseActions(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = props.mode === "edit";
  const testCase = isEdit ? props.testCase : null;

  const [description, setDescription] = useState(testCase?.description ?? "");
  const [input, setInput] = useState(
    testCase?.input ? JSON.stringify(testCase.input, null, 2) : ""
  );
  const [expected, setExpected] = useState(
    testCase?.expected ? JSON.stringify(testCase.expected, null, 2) : ""
  );
  const [order, setOrder] = useState(testCase?.order?.toString() ?? "");
  const [isPublished, setIsPublished] = useState(testCase?.isPublished ?? false);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setError(null);
      if (!isEdit) {
        setDescription("");
        setInput("");
        setExpected("");
        setOrder("");
        setIsPublished(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        description,
        input: JSON.parse(input),
        expected: JSON.parse(expected),
        order: Number(order),
        isPublished,
        studyCaseId: props.studyCaseId,
      };

      if (isEdit) {
        await api.patch(`/test-cases/${testCase!.id}`, payload);
      } else {
        await api.post("/test-cases", payload);
      }
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response: { data: { errors: string } } };
        setError(axiosError.response.data.errors);
      } else {
        setError("Invalid JSON format or something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!testCase) return;
    if (!confirm(`Delete this test case? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      await api.delete(`/test-cases/${testCase.id}`);
      router.refresh();
    } catch {
      alert("Failed to delete test case.");
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
          Add Test Case
        </Button>
      )}

      <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none">
          <DrawerHeader className="border-b">
            <DrawerTitle>
              {isEdit ? "Edit Test Case" : "Create Test Case"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. should return true for age 18"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="input">
                Input
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (JSON format)
                </span>
              </Label>
              <Textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"age": 18}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected">
                Expected
                <span className="text-muted-foreground font-normal ml-1 text-xs">
                  (JSON format)
                </span>
              </Label>
              <Textarea
                id="expected"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                placeholder='{"result": true}'
                rows={4}
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Published</Label>
                <p className="text-xs text-muted-foreground">
                  Published test cases are visible to students.
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
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