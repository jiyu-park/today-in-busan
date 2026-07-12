import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  ko: {
    nav: { home: '홈', events: '오늘의 행사', spots: '추천 관광지', stories: '역사 스토리', map: '지도 보기', language: '언어' },
    home: { eyebrow: 'Today in Busan', title: '오늘 부산에서\n어디로 떠날까요?', intro: '부산의 행사와 관광 데이터를 바탕으로 지금 보기 좋은 장소를 고르고, 일정처럼 둘러볼 수 있게 정리했습니다.', planner: '부산 여행 플래너', plannerBody: '바다, 산책, 야경, 가족 나들이 중 마음이 가는 분위기를 골라보세요. 먼저 추천 장소부터 둘러볼 수 있습니다.', explore: '오늘의 추천 관광지', viewSpots: '관광지 목록 보기', board: '추천 일정', loading: '관광지를 불러오는 중입니다.', error: '관광지 정보를 불러오지 못했습니다.' },
    events: { eyebrow: 'Busan events', title: '오늘의 행사', intro: '지금 부산에서 즐길 수 있는 축제와 이번 달의 행사를 확인해 보세요.', active: '오늘 진행 중인 행사', month: '이번 달 행사', year: '행사 캘린더', loading: '행사 정보를 불러오는 중입니다.', error: '행사 정보를 불러오지 못했습니다.', noneToday: '오늘 진행 중인 행사가 없습니다. 이번 달 행사를 확인해 보세요.', noneMonth: '이번 달에 예정된 행사가 없습니다.', noneYear: '예정 행사 없음', period: '기간', place: '장소', detail: '행사 상세 보기', back: '홈으로 돌아가기' },
    spots: { eyebrow: 'Recommended spots', title: '추천 관광지', intro: '부산의 대표 장소를 둘러보고 마음에 드는 곳의 상세 정보를 확인해 보세요.', back: '홈으로 돌아가기', loading: '관광지를 불러오는 중입니다.', error: '관광지 목록을 불러오지 못했습니다.', detail: '상세 정보 확인' },
    stories: { eyebrow: 'Busan stories', title: '역사 스토리', intro: '장소에 남은 시간과 사람들의 이야기를 따라 부산을 새롭게 만나보세요.', loading: '스토리를 불러오는 중입니다.', error: '역사 스토리를 불러오지 못했습니다.', detail: '장소 상세 보기' },
    map: { eyebrow: 'Explore Busan', title: '지도 보기', intro: '추천 관광지를 지도에서 살펴보고, 장소를 선택해 상세 정보를 확인하세요.', list: '관광지 목록', places: '추천 관광지', loading: '장소를 불러오는 중입니다.' },
    detail: { back: '목록으로 돌아가기', missing: '관광지를 찾을 수 없습니다.', intro: '부산의 장소에 담긴 이야기와 위치 정보를 확인해 보세요.', placeStory: '장소 소개', address: '주소', coordinates: '좌표', memo: '여행 메모', source: '데이터 안내', sourceBody: '대한민국 공공 관광 데이터를 바탕으로 표시합니다. 운영 시간과 이용 정보는 방문 전 공식 안내를 확인해 주세요.', location: '위치', openMap: '지도에서 보기', noCoordinates: '좌표 정보가 없어 지도를 표시할 수 없습니다.' },
    common: { busan: '부산', noInfo: '정보 없음', eventPlaceMissing: '장소 정보 확인 필요', eventPeriodMissing: '기간 정보 확인 필요', eventLoading: '행사 정보를 불러오는 중입니다.', eventMissing: '행사를 찾을 수 없습니다.', eventBack: '행사 목록으로 돌아가기', eventIntro: '부산에서 열리는 행사입니다. 방문 전 운영 정보와 일정은 주최 측 안내를 다시 확인해 주세요.', eventPeriod: '기간', eventPlace: '장소', contact: '연락처' },
  },
  en: {
    nav: { home: 'Home', events: "Today's events", spots: 'Recommended spots', stories: 'History stories', map: 'Map', language: 'Language' },
    home: { eyebrow: 'Today in Busan', title: 'Where should we\ngo in Busan today?', intro: 'Discover places worth visiting now using Busan event and tourism data, organized into an easy day plan.', planner: 'Busan trip planner', plannerBody: 'Choose a mood—sea, walking, night views, or a family outing—and start with a place picked for you.', explore: "Today's recommended spots", viewSpots: 'Browse tourist spots', board: 'Today board', loading: 'Loading tourist spots…', error: 'We could not load tourist spots.' },
    events: { eyebrow: 'Busan events', title: "Today's events", intro: 'Find festivals and events happening in Busan this month.', active: 'Happening today', month: 'This month', year: 'Event calendar', loading: 'Loading events…', error: 'We could not load events.', noneToday: 'There are no events happening today. Check this month’s listings.', noneMonth: 'There are no scheduled events this month.', noneYear: 'No scheduled events', period: 'Dates', place: 'Location', detail: 'View event details', back: 'Back home' },
    spots: { eyebrow: 'Recommended spots', title: 'Recommended spots', intro: 'Explore Busan’s signature places and open the details for somewhere you like.', back: 'Back home', loading: 'Loading tourist spots…', error: 'We could not load the tourist spots.', detail: 'View details' },
    stories: { eyebrow: 'Busan stories', title: 'History stories', intro: 'Meet Busan through the people, memories, and time held by each place.', loading: 'Loading stories…', error: 'We could not load the history stories.', detail: 'View place details' },
    map: { eyebrow: 'Explore Busan', title: 'Map', intro: 'Explore recommended places on the map and open a place for more details.', list: 'Tourist spots', places: 'Recommended spots', loading: 'Loading places…' },
    detail: { back: 'Back to list', missing: 'Tourist spot not found.', intro: 'Explore the story and location behind this Busan place.', placeStory: 'About this place', address: 'Address', coordinates: 'Coordinates', memo: 'Travel note', source: 'Data note', sourceBody: 'Information is provided using public Korean tourism data. Check the official site for hours and visitor information.', location: 'Location', openMap: 'Open in map', noCoordinates: 'There are no coordinates available for this map.' },
    common: { busan: 'Busan', noInfo: 'No information', eventPlaceMissing: 'Location unavailable', eventPeriodMissing: 'Dates unavailable', eventLoading: 'Loading event information…', eventMissing: 'Event not found.', eventBack: 'Back to events', eventIntro: 'An event taking place in Busan. Check the organizer’s latest notice before visiting.', eventPeriod: 'Dates', eventPlace: 'Location', contact: 'Contact' },
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ko');
  const value = useMemo(() => ({ language, setLanguage, copy: translations[language] }), [language]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
