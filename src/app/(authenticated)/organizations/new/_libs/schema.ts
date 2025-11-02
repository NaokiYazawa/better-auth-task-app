import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "組織名は必須です" })
    .max(100, { message: "組織名は100文字以内で入力してください" }),
  slug: z
    .string()
    .min(1, { message: "スラッグは必須です" })
    .max(50, { message: "スラッグは50文字以内で入力してください" })
    .regex(/^[a-z0-9-]+$/, {
      message: "スラッグは小文字の英数字とハイフンのみ使用できます",
    }),
  logo: z.enum(
    [
      "gallery-vertical-end",
      "audio-waveform",
      "building-2",
      "briefcase",
      "layers",
      "package",
    ],
    {
      required_error: "ロゴを選択してください",
    },
  ),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export type LogoIconKey = z.infer<typeof organizationFormSchema>["logo"];
