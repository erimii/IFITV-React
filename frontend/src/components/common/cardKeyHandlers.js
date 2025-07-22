// Space/Enter 키로 클릭 동작을 트리거하는 공통 핸들러
export function handleCardKeyDownWithSpace(e, onClick) {
  if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
    e.preventDefault();
    onClick && onClick();
  }
} 