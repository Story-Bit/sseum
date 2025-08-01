// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // 오류의 원인이었던 useTheme() 호출을 완전히 제거합니다.
  
  return (
    <Sonner
      // theme 속성 자체를 제거하여, sonner의 기본 동작에 맡깁니다.
      // 이렇게 하면 더 이상 next-themes에 의존하지 않습니다.
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }