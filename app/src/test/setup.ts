import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Las pruebas de las Edge Functions corren en Node, sin window.
if (typeof window !== "undefined") {
  // jsdom no trae estas APIs del navegador; las animaciones de motion las consultan.
  if (!window.matchMedia) {
    window.matchMedia = (consulta: string) =>
      ({
        matches: false,
        media: consulta,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  if (!("IntersectionObserver" in window)) {
    class ObservadorFalso {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.assign(window, { IntersectionObserver: ObservadorFalso });
  }

  // ScrollRestoration de React Router llama a scrollTo, que jsdom no implementa.
  window.scrollTo = () => {};
}

afterEach(() => {
  cleanup();
});
