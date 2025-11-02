import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon HTTP クライアントの初期化
 *
 * Edge Runtime 互換性:
 * - drizzle-orm/neon-http は Edge Runtime で動作
 * - WebSocket 不要（HTTP ベース）
 * - Next.js middleware で使用可能
 *
 * トランザクション代替:
 * - db.batch() API を使用
 * - 複数クエリを1つの HTTP リクエストで実行
 * - ほぼアトミックな動作を保証
 *
 * 参考:
 * - https://github.com/drizzle-team/drizzle-orm-docs/blob/main/src/content/docs/connect-neon.mdx
 * - https://github.com/drizzle-team/drizzle-orm-docs/blob/main/src/content/docs/batch-api.mdx
 */
const sql = neon(process.env.DATABASE_URL as string);

// Drizzle インスタンスの作成
export const db = drizzle({ client: sql, schema });
