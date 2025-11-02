"use client";

import { CalendarIcon, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationTask } from "../_libs/queries";
import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskCompleteAction,
  updateTaskAction,
} from "../actions";

type Priority = "low" | "medium" | "high";

interface TaskListProps {
  tasks: OrganizationTask[];
}

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200",
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: Date | null) => {
  if (!date) return "期限なし";
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<OrganizationTask | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    dueDate: string;
    priority: Priority;
  }>({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "medium",
  });

  const handleToggleComplete = async (taskId: string) => {
    try {
      const result = await toggleTaskCompleteAction({ id: taskId });

      if (result?.data?.success) {
        toast.success("タスクのステータスを更新しました");
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      }
    } catch (error) {
      toast.error("タスクの更新に失敗しました");
      console.error("Failed to toggle task:", error);
    }
  };

  const handleEdit = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask({ ...task });
      setEditDialogOpen(true);
    }
  };

  const handleEditSave = async () => {
    if (!editingTask) return;

    setIsSubmitting(true);

    try {
      const result = await updateTaskAction({
        id: editingTask.id,
        title: editingTask.title,
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split("T")[0]
          : null,
        priority: editingTask.priority as Priority,
      });

      if (result?.data?.success) {
        toast.success("タスクを更新しました");
        setEditDialogOpen(false);
        setEditingTask(null);
        router.refresh();
      } else if (result?.validationErrors) {
        toast.error("入力内容を確認してください");
      } else if (result?.serverError) {
        toast.error(result.serverError);
      }
    } catch (error) {
      toast.error("タスクの更新に失敗しました");
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTaskId) return;

    try {
      const result = await deleteTaskAction({ id: selectedTaskId });

      if (result?.data?.success) {
        toast.success("タスクを削除しました");
        setDeleteDialogOpen(false);
        setSelectedTaskId(null);
        router.refresh();
      } else if (result?.serverError) {
        toast.error(result.serverError);
      }
    } catch (error) {
      toast.error("タスクの削除に失敗しました");
      console.error("Failed to delete task:", error);
    }
  };

  const handleAddTask = () => {
    setNewTask({
      title: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "medium",
    });
    setAddDialogOpen(true);
  };

  const handleAddSave = async () => {
    if (!newTask.title.trim()) return;

    setIsSubmitting(true);

    try {
      const result = await createTaskAction({
        title: newTask.title,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
      });

      if (result?.data?.success) {
        toast.success("タスクを作成しました", {
          description: result.data.taskTitle,
        });
        setAddDialogOpen(false);
        setNewTask({
          title: "",
          dueDate: new Date().toISOString().split("T")[0],
          priority: "medium",
        });
        router.refresh();
      } else if (result?.validationErrors) {
        // バリデーションエラー
        toast.error("入力内容を確認してください");
      } else if (result?.serverError) {
        // サーバーエラー
        toast.error(result.serverError);
      }
    } catch (error) {
      toast.error("タスクの作成に失敗しました");
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleAddTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                タスクがありません。「Add Task」ボタンから追加してください。
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="w-full">
              <CardContent className="flex items-start gap-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className={`text-lg font-semibold leading-tight ${
                        task.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="hover:bg-accent rounded-md p-1 transition-colors">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(task.id)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>編集</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(task.id)}
                          variant="destructive"
                          className="cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>削除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>

                    <Badge
                      className={priorityColors[task.priority as Priority]}
                    >
                      {task.priority === "low" && "低"}
                      {task.priority === "medium" && "中"}
                      {task.priority === "high" && "高"}
                    </Badge>

                    <div className="ml-auto flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {task.author.image && (
                          <AvatarImage
                            src={task.author.image}
                            alt={task.author.name}
                          />
                        )}
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(task.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {task.author.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 新規追加ダイアログ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しいタスクを追加</DialogTitle>
            <DialogDescription>
              新しいタスクの詳細を入力してください。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-title">タスク名</Label>
              <Input
                id="new-title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="タスク名を入力"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-dueDate">期限</Label>
              <Input
                id="new-dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-priority">優先度</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value: Priority) =>
                  setNewTask({ ...newTask, priority: value })
                }
              >
                <SelectTrigger id="new-priority" className="w-full">
                  <SelectValue placeholder="優先度を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setNewTask({
                  title: "",
                  dueDate: new Date().toISOString().split("T")[0],
                  priority: "medium",
                });
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleAddSave}
              disabled={!newTask.title.trim() || isSubmitting}
            >
              {isSubmitting ? "作成中..." : "追加"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。本当にこのタスクを削除してもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクを編集</DialogTitle>
            <DialogDescription>
              タスクの詳細を編集してください。
            </DialogDescription>
          </DialogHeader>

          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タスク名</Label>
                <Input
                  id="title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                  placeholder="タスク名を入力"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">期限</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={
                    editingTask.dueDate
                      ? new Date(editingTask.dueDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      dueDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">優先度</Label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(value: Priority) =>
                    setEditingTask({ ...editingTask, priority: value })
                  }
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="優先度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingTask(null);
              }}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editingTask?.title.trim() || isSubmitting}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
