import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import {
  type OrganizationFormValues,
  organizationFormSchema,
} from "../_libs/schema";
import { createOrganizationAction } from "../actions";

export function useOrganizationForm(
  defaultValues: OrganizationFormValues,
  callbacks?: {
    onSuccess?: () => void;
    onNavigation?: () => void;
  },
) {
  // useHookFormAction: useAction + useForm の統合フック
  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(
      createOrganizationAction,
      zodResolver(organizationFormSchema),
      {
        // actionProps: useAction に渡すプロップス
        actionProps: {
          // サーバーアクション実行時のコールバック（オプション）
          onExecute: () => {
            console.log("[useOrganizationForm] アクション実行開始");
          },
          // サーバーアクション成功時のコールバック
          // データが正常に返された場合（redirect を使わない場合）
          onSuccess: ({ data }) => {
            console.log("[useOrganizationForm] アクション成功:", data);
            callbacks?.onSuccess?.();
          },
          /**
           * エラー時のコールバック
           *
           * 1. validationErrors は useHookFormAction により自動的に
           *    React Hook Form の FieldErrors にマッピングされる
           * 2. フォームフィールドの <FormMessage /> に自動表示される
           * 3. したがって、validationErrors は追加のハンドリング不要
           * 4. serverError のみをユーザーに通知する必要がある
           *
           * error オブジェクトの構造（"formatted" 形式）:
           * - validationErrors: { _errors: [...], field: { _errors: [...] } }
           * - serverError: string | undefined
           *
           * 重要:
           * - defaultValidationErrorsShape を "formatted"（デフォルト）に設定
           * - これにより useHookFormAction の自動マッピングが正しく機能する
           */
          onError: ({ error }) => {
            // バリデーションエラーは自動的にフォームにマッピングされる
            if (error.validationErrors) {
              console.log(
                "[useOrganizationForm] バリデーションエラー（自動マッピング）:",
                error.validationErrors,
              );
              // バリデーションエラーは FormMessage で自動表示されるため、
              // ここでは追加の処理不要
            }

            // サーバーエラー（予期しないエラー）のみをユーザーに通知
            if (error.serverError) {
              console.error(
                "[useOrganizationForm] サーバーエラー:",
                error.serverError,
              );
              // 本番環境では toast などを使用することを推奨
              // toast.error(error.serverError);
            }
          },
        },
        // formProps: useForm に渡すプロップス
        formProps: {
          defaultValues,
          // フォーム送信時にのみ再バリデーション（パフォーマンス最適化）
          reValidateMode: "onSubmit",
        },
        // errorMapProps: エラーマッピングの設定（オプション）
        errorMapProps: {
          // 複数のエラーメッセージを結合する文字（デフォルト: " "）
          joinBy: ", ",
        },
      },
    );

  return {
    /**
     * React Hook Form インスタンス
     * - register, control, formState などのメソッドを提供
     */
    form,

    /**
     * フォーム送信ハンドラー
     * - form.handleSubmit と action.executeAsync を統合
     * - バリデーションエラーを自動的にフォームに設定
     */
    handleSubmitWithAction,

    /**
     * フォームとアクションの状態をリセット
     */
    resetFormAndAction,

    /**
     * アクションの実行状態
     * - 従来の useState(isSubmitting) の代替
     */
    isSubmitting: action.isExecuting,

    /**
     * アクションの成功状態（データが返された場合）
     * 注意: redirect() が呼ばれた場合は false のまま
     */
    hasSucceeded: action.hasSucceeded,

    /**
     * ナビゲーション発生状態（redirect() が呼ばれた場合）
     * next-safe-action v8: redirect() 時は hasNavigated が true になる
     */
    hasNavigated: action.hasNavigated,

    /**
     * アクションのエラー状態
     */
    hasErrored: action.hasErrored,

    /**
     * サーバーエラーメッセージ（存在する場合）
     */
    serverError: action.result.serverError,

    /**
     * アクション結果全体（高度な使用ケース）
     */
    result: action.result,
  };
}
