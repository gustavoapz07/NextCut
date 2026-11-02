// Lo único de Sentry que usa la app. errores.ts lo importa con import(): así queda en un archivo
// aparte y solo con esto, sin la grabación de sesiones, las trazas ni el resto del SDK.
export { captureException, init } from "@sentry/react";
