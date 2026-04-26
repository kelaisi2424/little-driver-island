// 飘动的云朵装饰，纯 CSS。常用于首页/通关页/休息页背景层。

interface CloudsProps {
  variant?: 'sky' | 'sparse';
}

export default function Clouds({ variant = 'sky' }: CloudsProps) {
  if (variant === 'sparse') {
    return (
      <>
        <span className="ui-cloud uc-1" aria-hidden />
        <span className="ui-cloud uc-2" aria-hidden />
      </>
    );
  }
  return (
    <>
      <span className="ui-cloud uc-1" aria-hidden />
      <span className="ui-cloud uc-2" aria-hidden />
      <span className="ui-cloud uc-3" aria-hidden />
      <span className="ui-cloud uc-4" aria-hidden />
    </>
  );
}
