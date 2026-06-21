"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Material } from "@/types";

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
  | { mode: "create"; conceptId: number }
  | { mode: "edit"; material: Material; conceptId: number };

export default function MaterialActions(props: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = props.mode === "edit";
  const material = isEdit ? props.material : null;

  const [title, setTitle] = useState(material?.title ?? "");
  const [content, setContent] = useState(material?.content ?? "");
  const [order, setOrder] = useState(material?.order?.toString() ?? "");

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setError(null);
      if (!isEdit) {
        setTitle("");
        setContent("");
        setOrder("");
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await api.patch(`/materials/${material!.id}`, {
          title,
          content,
          order: Number(order),
        });
      } else {
        await api.post("/materials", {
          title,
          content,
          order: Number(order),
          conceptId: props.conceptId,
        });
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
    if (!material) return;
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      await api.delete(`/materials/${material.id}`);
      router.refresh();
    } catch {
      alert("Failed to delete material.");
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
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      )}

      <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
        <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none">
          <DrawerHeader className="border-b">
            <DrawerTitle>
              {isEdit ? "Edit Material" : "Create Material"}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. If & Else"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write material content in Markdown..."
                rows={12}
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