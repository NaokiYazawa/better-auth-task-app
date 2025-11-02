"use client";

import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { logoIcons } from "@/lib/logo-icons";
import { useOrganizationForm } from "../_hooks/use-organization-form";
import type { OrganizationFormValues } from "../_libs/schema";

interface OrganizationFormFieldsProps {
  form: UseFormReturn<OrganizationFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function OrganizationFormFields({
  form,
  onSubmit,
  isSubmitting,
}: OrganizationFormFieldsProps) {
  const handleNameChange = (value: string) => {
    form.setValue("name", value);

    // Auto-generate slug from name
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>組織名</FormLabel>
              <FormControl>
                <Input
                  placeholder="Acme Corporation"
                  {...field}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                組織の正式名称を入力してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>スラッグ</FormLabel>
              <FormControl>
                <Input placeholder="acme-corporation" {...field} />
              </FormControl>
              <FormDescription>
                URLで使用される一意の識別子です。小文字の英数字とハイフンのみ使用できます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>ロゴ</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {Object.entries(logoIcons).map(
                    ([key, { icon: Icon, label }]) => (
                      <FormItem key={key}>
                        <FormControl>
                          <div className="relative">
                            <RadioGroupItem
                              value={key}
                              id={`logo-${key}`}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={`logo-${key}`}
                              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-transparent p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent cursor-pointer transition-all"
                            >
                              <Icon className="h-8 w-8" />
                              <span className="text-sm font-medium">
                                {label}
                              </span>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    ),
                  )}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                組織を表すロゴアイコンを選択してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "作成中..." : "組織を作成"}
        </Button>
      </form>
    </Form>
  );
}

export function OrganizationForm() {
  const router = useRouter();

  /**
   * 組織作成フォーム
   *
   * 根拠:
   * 1. Server Action は成功データを返すのみ（redirect は呼ばない）
   * 2. クライアント側で onSuccess コールバックを使用してナビゲーション
   * 3. これにより、Server Action 内での redirect() エラー（NEXT_REDIRECT）を回避
   * 4. 招待受諾機能（invitation-confirmation-wrapper.tsx）と同じパターン
   *
   * エラーハンドリング:
   * - バリデーションエラー: useHookFormAction により自動的に
   *   フォームフィールドの <FormMessage /> に表示される
   * - サーバーエラー: onError コールバックで console.error される
   *   （本番環境では toast ライブラリを使用することを推奨）
   */
  const { form, handleSubmitWithAction, isSubmitting } = useOrganizationForm(
    {
      name: "",
      slug: "",
      logo: "building-2",
    },
    {
      onSuccess: () => {
        // 組織作成成功後、タスク一覧ページへリダイレクト
        router.push("/tasks");
      },
    },
  );

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>組織を作成</CardTitle>
        <CardDescription>
          新しい組織の情報を入力してください。組織名からスラッグが自動生成されます。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OrganizationFormFields
          form={form}
          onSubmit={handleSubmitWithAction}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}
