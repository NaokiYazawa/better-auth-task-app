import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden">
      <Hero
        heading="タスク管理アプリケーション"
        description="効率的なタスク管理とチームコラボレーションを実現する、モダンなWebアプリケーション。shadcn/uiとNext.jsで構築された美しいインターフェースをお楽しみください。"
        button={{
          text: "今すぐ始める",
          url: "/sign-in",
        }}
        reviews={{
          count: 150,
          rating: 4.9,
          avatars: [
            {
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
              alt: "ユーザー 1",
            },
            {
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
              alt: "ユーザー 2",
            },
            {
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
              alt: "ユーザー 3",
            },
            {
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
              alt: "ユーザー 4",
            },
            {
              src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
              alt: "ユーザー 5",
            },
          ],
        }}
      />
    </div>
  );
}
