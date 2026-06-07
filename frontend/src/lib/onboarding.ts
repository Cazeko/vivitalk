// 온보딩 가이드 진행 상태 — 단일 seam.
//
// 저장소: 서버 `clients.onboarding`(JSONB) → 기기 간 동기화됨.
// 캐시: authStore.user.onboarding (로그인 시 /me 로 하이드레이트, localStorage 에도 persist).
//
// 읽기는 캐시에서 동기적으로, 쓰기는 캐시 낙관적 업데이트 + 서버 PATCH(fire-and-forget).
// 호출부(OnboardingGuide, EmbedTab)는 함수 시그니처를 그대로 사용한다 — 구현만 교체됨.

import { api, OnboardingState } from "./api";
import { useAuthStore } from "@/stores/authStore";

function current(): OnboardingState {
  return useAuthStore.getState().user?.onboarding ?? {};
}

export const isOnboardingDismissed = () => current().dismissed === true;
export const hasEmbedded = () => current().embedded === true;

/** 캐시(authStore.user.onboarding)에 부분 병합 — UI 즉시 반영용 낙관적 업데이트. */
function cacheMerge(partial: OnboardingState) {
  const { user } = useAuthStore.getState();
  if (!user) return;
  useAuthStore.setState({
    user: { ...user, onboarding: { ...(user.onboarding ?? {}), ...partial } },
  });
}

function persist(partial: OnboardingState) {
  cacheMerge(partial);
  // 서버 동기화 실패는 치명적이지 않음 — 다음 로그인/refreshMe 시 서버 상태로 정정된다.
  api.updateOnboarding(partial).catch(() => {});
}

export const dismissOnboarding = () => persist({ dismissed: true });
/** 임베드 코드를 복사하면 "웹사이트에 연결하기" 단계를 완료로 표시. */
export const markEmbedded = () => persist({ embedded: true });
